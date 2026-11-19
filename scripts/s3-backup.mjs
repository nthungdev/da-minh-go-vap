#!/usr/bin/env node

/**
 * S3 / Cloudflare R2 Backup Script
 *
 * Downloads all objects (or a prefixed subset) from an S3/R2 bucket to a local directory.
 * Automatically loads credentials from .env files or CLI parameters.
 * Supports concurrent downloads, resume/skip existing files, and optional tar.gz compression.
 *
 * Usage:
 *   node scripts/s3-backup.mjs [options]
 *   pnpm s3:backup [options]
 *
 * Examples:
 *   node scripts/s3-backup.mjs --env production
 *   node scripts/s3-backup.mjs --archive
 *   node scripts/s3-backup.mjs --prefix media/ --out ./my-backups
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_BACKUP_DIR = path.join(PROJECT_ROOT, "tmp", "backups");

/**
 * Format bytes to human readable format (KB, MB, GB).
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format milliseconds to readable string (e.g. "1m 24s" or "4.5s").
 */
function formatDuration(ms) {
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Normalize S3 endpoint: strips trailing bucket names or paths from Cloudflare R2 endpoints.
 */
function normalizeEndpoint(endpoint, bucket) {
  if (!endpoint) return undefined;
  try {
    const url = new URL(endpoint);
    // Cloudflare R2 S3 endpoints should always be origin only: https://<account_id>.r2.cloudflarestorage.com
    if (url.hostname.endsWith(".r2.cloudflarestorage.com")) {
      return `${url.protocol}//${url.hostname}`;
    }
    // If endpoint ends with /<bucket>, strip the bucket name
    if (bucket && url.pathname.replace(/\/+$/, "") === `/${bucket}`) {
      url.pathname = "";
      return url.toString().replace(/\/$/, "");
    }
    return endpoint;
  } catch {
    return endpoint;
  }
}

/**
 * Parse a .env file content into key-value pairs without external dependencies.
 */
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (match) {
      let value = match[2].trim();
      // Remove enclosing quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[match[1]] = value;
    }
  }
  return env;
}

/**
 * Load environment variables by trying specified environment or standard files.
 */
function loadEnvironment(envName, explicitEnvFile) {
  if (explicitEnvFile) {
    const fullPath = path.isAbsolute(explicitEnvFile)
      ? explicitEnvFile
      : path.resolve(PROJECT_ROOT, explicitEnvFile);
    if (fs.existsSync(fullPath)) {
      console.log(
        `✅ Loaded environment from: ${path.relative(PROJECT_ROOT, fullPath)}`,
      );
      return parseEnvFile(fullPath);
    } else {
      console.error(
        `❌ Error: Specified env file not found: ${explicitEnvFile}`,
      );
      process.exit(1);
    }
  }

  const envCandidates = [];
  if (envName) {
    const normalized = envName.toLowerCase().replace(/^\./, "");
    envCandidates.push(
      path.join(PROJECT_ROOT, `.env.${normalized}`),
      path.join(PROJECT_ROOT, `.env.${normalized}.local`),
    );
  }

  envCandidates.push(
    path.join(PROJECT_ROOT, ".env.local"),
    path.join(PROJECT_ROOT, ".env"),
    path.join(PROJECT_ROOT, ".env.production"),
    path.join(PROJECT_ROOT, ".env.staging"),
  );

  for (const candidate of envCandidates) {
    if (fs.existsSync(candidate)) {
      console.log(
        `✅ Loaded environment from: ${path.relative(PROJECT_ROOT, candidate)}`,
      );
      return parseEnvFile(candidate);
    }
  }

  console.warn("⚠️ Warning: No .env file found. Falling back to process.env.");
  return {};
}

/**
 * Print CLI help and exit.
 */
function printHelp() {
  console.log(`
📦 S3 / Cloudflare R2 Backup Script

Usage:
  node scripts/s3-backup.mjs [options]
  pnpm s3:backup [options]

Options:
  -e, --env <name>         Environment name (e.g. production, staging, local)
  --env-file <path>        Path to custom .env file
  -b, --bucket <name>      Override S3 bucket name (default: from S3_BUCKET)
  -p, --prefix <prefix>    Only backup objects matching key prefix
  -o, --out <dir>          Target backup directory (default: tmp/backups/s3_<timestamp>)
  -c, --concurrency <num>  Number of concurrent downloads (default: 10)
  -z, --archive            Compress downloaded files to .tar.gz archive
  --clean-dir              Remove uncompressed directory after creating archive (only with -z)
  -f, --force              Re-download files even if size matches locally
  -h, --help               Show this help message

Environment Variables:
  S3_BUCKET / R2_BUCKET
  S3_ACCESS_KEY_ID / R2_ACCESS_KEY_ID / AWS_ACCESS_KEY_ID
  S3_SECRET / S3_SECRET_ACCESS_KEY / R2_SECRET_ACCESS_KEY / AWS_SECRET_ACCESS_KEY
  S3_ENDPOINT / R2_ENDPOINT / AWS_ENDPOINT_URL_S3
  S3_REGION (default: "auto")

Examples:
  pnpm s3:backup
  pnpm s3:backup --env production --archive
  pnpm s3:backup --prefix media/ --out ./media-backup
`);
}

const BACKUP_VALUE_FLAGS = {
  "-e": "envName",
  "--env": "envName",
  "--env-file": "envFile",
  "-b": "bucket",
  "--bucket": "bucket",
  "-p": "prefix",
  "--prefix": "prefix",
  "-o": "outDir",
  "--out": "outDir",
  "-c": "concurrency",
  "--concurrency": "concurrency",
};

const BACKUP_BOOLEAN_FLAGS = {
  "-z": "archive",
  "--archive": "archive",
  "--tar": "archive",
  "--clean-dir": "cleanDir",
  "-f": "force",
  "--force": "force",
};

function setBackupOption(options, key, value) {
  options[key] = key === "concurrency" ? parseInt(value, 10) || 10 : value;
}

function tryApplyEqualsFlag(arg, options) {
  const eqIndex = arg.indexOf("=");
  if (eqIndex === -1) return false;
  const flag = arg.slice(0, eqIndex);
  if (!(flag in BACKUP_VALUE_FLAGS)) return false;
  setBackupOption(options, BACKUP_VALUE_FLAGS[flag], arg.slice(eqIndex + 1));
  return true;
}

/**
 * Parse CLI options.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    envName: "",
    envFile: "",
    bucket: "",
    prefix: "",
    outDir: "",
    concurrency: 10,
    archive: false,
    cleanDir: false,
    force: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    }

    if (arg in BACKUP_BOOLEAN_FLAGS) {
      options[BACKUP_BOOLEAN_FLAGS[arg]] = true;
      continue;
    }

    if (arg in BACKUP_VALUE_FLAGS) {
      setBackupOption(options, BACKUP_VALUE_FLAGS[arg], args[++i]);
      continue;
    }

    if (tryApplyEqualsFlag(arg, options)) {
      continue;
    }

    if (!(arg.startsWith("-") || options.envName)) {
      // Positional environment parameter, e.g. "pnpm s3:backup production"
      options.envName = arg;
    }
  }

  return options;
}

function resolveBackupConfig(options, env) {
  const bucket = options.bucket || env.S3_BUCKET || env.R2_BUCKET;
  const accessKeyId =
    env.S3_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    env.S3_SECRET ||
    env.S3_SECRET_ACCESS_KEY ||
    env.R2_SECRET_ACCESS_KEY ||
    env.AWS_SECRET_ACCESS_KEY;
  const endpoint = normalizeEndpoint(
    env.S3_ENDPOINT ||
      env.R2_ENDPOINT ||
      env.AWS_ENDPOINT_URL_S3 ||
      env.AWS_ENDPOINT_URL,
    bucket,
  );
  const region = env.S3_REGION || "auto";

  if (!bucket) {
    console.error("❌ Error: S3 Bucket is not specified.");
    console.error("Please set S3_BUCKET in your .env or pass --bucket <name>.");
    process.exit(1);
  }

  if (!(accessKeyId && secretAccessKey)) {
    console.error("❌ Error: S3 credentials are missing.");
    console.error("Please set S3_ACCESS_KEY_ID and S3_SECRET in your .env.");
    process.exit(1);
  }

  return { bucket, accessKeyId, secretAccessKey, endpoint, region };
}

function resolveTargetDir(options, bucket) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .split(".")[0];
  const backupDirName = `s3_${bucket}_${timestamp}`;
  const targetDir = options.outDir
    ? path.resolve(options.outDir)
    : path.join(DEFAULT_BACKUP_DIR, backupDirName);

  fs.mkdirSync(targetDir, { recursive: true });
  return targetDir;
}

async function listBucketObjects(s3Client, bucket, prefix) {
  const objects = [];
  let continuationToken;

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix || undefined,
      ContinuationToken: continuationToken,
    });

    const listResponse = await s3Client.send(listCommand);
    for (const item of listResponse.Contents ?? []) {
      // Skip directory marker keys (keys ending with '/')
      if (!item.Key.endsWith("/")) {
        objects.push(item);
      }
    }
    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

async function writeS3BodyToFile(body, destPath) {
  const writeStream = fs.createWriteStream(destPath);

  if (body instanceof Readable) {
    await pipeline(body, writeStream);
    return;
  }

  if (body && typeof body.transformToWebStream === "function") {
    await pipeline(Readable.fromWeb(body.transformToWebStream()), writeStream);
    return;
  }

  throw new Error("Unsupported S3 response body stream");
}

function isFileUpToDate(destPath, expectedSize, force) {
  if (force || !fs.existsSync(destPath)) {
    return false;
  }
  return fs.statSync(destPath).size === expectedSize;
}

async function downloadObjects({
  s3Client,
  bucket,
  objects,
  targetDir,
  options,
}) {
  const stats = {
    completedCount: 0,
    downloadedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    downloadedBytes: 0,
  };

  async function downloadObject(item) {
    const key = item.Key;
    const destPath = path.join(targetDir, key);

    try {
      if (isFileUpToDate(destPath, item.Size, options.force)) {
        stats.skippedCount++;
        stats.completedCount++;
        return;
      }

      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      const response = await s3Client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key }),
      );
      await writeS3BodyToFile(response.Body, destPath);

      stats.downloadedCount++;
      stats.downloadedBytes += item.Size || 0;
      stats.completedCount++;

      const percent = ((stats.completedCount / objects.length) * 100).toFixed(
        1,
      );
      process.stdout.write(
        `\r⏳ [${stats.completedCount}/${objects.length}] (${percent}%) - ${path.basename(key).slice(0, 40)}`,
      );
    } catch (err) {
      stats.failedCount++;
      stats.completedCount++;
      console.error(`\n❌ Failed to download '${key}': ${err.message}`);
    }
  }

  const concurrency = Math.max(1, options.concurrency);
  let queueIndex = 0;

  async function worker() {
    while (queueIndex < objects.length) {
      const currentItem = objects[queueIndex++];
      await downloadObject(currentItem);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, objects.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return stats;
}

function createBackupArchive(targetDir, cleanDir) {
  const archivePath = `${targetDir}.tar.gz`;
  console.log(`\n⏳ Compressing backup to ${archivePath} ...`);

  try {
    execFileSync("tar", ["-czf", archivePath, "-C", targetDir, "."], {
      stdio: "inherit",
    });

    const archiveStats = fs.statSync(archivePath);
    console.log(
      `📦 Archive created: ${archivePath} (${formatBytes(archiveStats.size)})`,
    );

    if (cleanDir) {
      console.log(`🧹 Removing uncompressed directory ${targetDir} ...`);
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  } catch (archiveErr) {
    console.error(`❌ Archive compression failed: ${archiveErr.message}`);
  }
}

/**
 * Main runner function.
 */
async function main() {
  const options = parseArgs();
  const fileEnv = loadEnvironment(options.envName, options.envFile);
  // Merge process.env with loaded file env (loaded file env takes precedence if explicitly requested)
  const env = { ...process.env, ...fileEnv };
  const { bucket, accessKeyId, secretAccessKey, endpoint, region } =
    resolveBackupConfig(options, env);
  const targetDir = resolveTargetDir(options, bucket);

  console.log(`\n========================================`);
  console.log(`🚀 Starting S3 Backup`);
  console.log(`========================================`);
  console.log(`🪣  Bucket:      ${bucket}`);
  console.log(`🌐 Endpoint:    ${endpoint || "AWS Default"}`);
  console.log(`📍 Region:      ${region}`);
  if (options.prefix) {
    console.log(`🔍 Prefix:      ${options.prefix}`);
  }
  console.log(`📁 Destination: ${targetDir}`);
  console.log(`⚡ Concurrency: ${options.concurrency}`);
  console.log(`========================================\n`);

  const s3Client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: { accessKeyId, secretAccessKey },
  });

  // Step 1: List all objects
  console.log(`⏳ Listing objects from bucket '${bucket}'...`);
  const startTime = Date.now();
  const objects = await listBucketObjects(s3Client, bucket, options.prefix);

  if (objects.length === 0) {
    console.log(
      `⚠️ No objects found in bucket '${bucket}'${options.prefix ? ` with prefix '${options.prefix}'` : ""}.`,
    );
    return;
  }

  const totalBytes = objects.reduce((sum, item) => sum + (item.Size || 0), 0);
  console.log(
    `📦 Found ${objects.length} objects (Total: ${formatBytes(totalBytes)})\n`,
  );

  // Step 2: Download objects with concurrency control
  const { downloadedCount, skippedCount, failedCount, downloadedBytes } =
    await downloadObjects({ s3Client, bucket, objects, targetDir, options });

  const duration = Date.now() - startTime;
  process.stdout.write(`\r${" ".repeat(80)}\r`); // Clear progress line

  console.log(`\n========================================`);
  console.log(`✅ Backup Completed in ${formatDuration(duration)}`);
  console.log(`========================================`);
  console.log(
    `📥 Downloaded: ${downloadedCount} files (${formatBytes(downloadedBytes)})`,
  );
  if (skippedCount > 0) {
    console.log(`⏭️  Skipped:    ${skippedCount} files (already up to date)`);
  }
  if (failedCount > 0) {
    console.log(`❌ Failed:     ${failedCount} files`);
  }
  console.log(`📂 Location:   ${targetDir}`);

  // Step 3: Create archive if requested
  if (options.archive) {
    createBackupArchive(targetDir, options.cleanDir);
  }

  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal backup error:", err);
  process.exit(1);
});
