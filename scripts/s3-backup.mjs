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

import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
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
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
    } else if (arg === "-e" || arg === "--env") {
      options.envName = args[++i];
    } else if (arg.startsWith("--env=")) {
      options.envName = arg.split("=")[1];
    } else if (arg === "--env-file") {
      options.envFile = args[++i];
    } else if (arg.startsWith("--env-file=")) {
      options.envFile = arg.split("=")[1];
    } else if (arg === "-b" || arg === "--bucket") {
      options.bucket = args[++i];
    } else if (arg.startsWith("--bucket=")) {
      options.bucket = arg.split("=")[1];
    } else if (arg === "-p" || arg === "--prefix") {
      options.prefix = args[++i];
    } else if (arg.startsWith("--prefix=")) {
      options.prefix = arg.split("=")[1];
    } else if (arg === "-o" || arg === "--out") {
      options.outDir = args[++i];
    } else if (arg.startsWith("--out=")) {
      options.outDir = arg.split("=")[1];
    } else if (arg === "-c" || arg === "--concurrency") {
      options.concurrency = parseInt(args[++i], 10) || 10;
    } else if (arg.startsWith("--concurrency=")) {
      options.concurrency = parseInt(arg.split("=")[1], 10) || 10;
    } else if (arg === "-z" || arg === "--archive" || arg === "--tar") {
      options.archive = true;
    } else if (arg === "--clean-dir") {
      options.cleanDir = true;
    } else if (arg === "-f" || arg === "--force") {
      options.force = true;
    } else if (!arg.startsWith("-") && !options.envName) {
      // Positional environment parameter, e.g. "pnpm s3:backup production"
      options.envName = arg;
    }
  }

  return options;
}

/**
 * Main runner function.
 */
async function main() {
  const options = parseArgs();
  const fileEnv = loadEnvironment(options.envName, options.envFile);

  // Merge process.env with loaded file env (loaded file env takes precedence if explicitly requested)
  const env = { ...process.env, ...fileEnv };

  const bucket = options.bucket || env.S3_BUCKET || env.R2_BUCKET;

  const accessKeyId =
    env.S3_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;

  const secretAccessKey =
    env.S3_SECRET ||
    env.S3_SECRET_ACCESS_KEY ||
    env.R2_SECRET_ACCESS_KEY ||
    env.AWS_SECRET_ACCESS_KEY;

  const endpoint =
    env.S3_ENDPOINT ||
    env.R2_ENDPOINT ||
    env.AWS_ENDPOINT_URL_S3 ||
    env.AWS_ENDPOINT_URL;

  const region = env.S3_REGION || "auto";

  if (!bucket) {
    console.error("❌ Error: S3 Bucket is not specified.");
    console.error("Please set S3_BUCKET in your .env or pass --bucket <name>.");
    process.exit(1);
  }

  if (!accessKeyId || !secretAccessKey) {
    console.error("❌ Error: S3 credentials are missing.");
    console.error("Please set S3_ACCESS_KEY_ID and S3_SECRET in your .env.");
    process.exit(1);
  }

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
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  // Step 1: List all objects
  console.log(`⏳ Listing objects from bucket '${bucket}'...`);
  const startTime = Date.now();
  const objects = [];
  let continuationToken = undefined;

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: options.prefix || undefined,
      ContinuationToken: continuationToken,
    });

    const listResponse = await s3Client.send(listCommand);
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      for (const item of listResponse.Contents) {
        // Skip directory marker keys (keys ending with '/')
        if (!item.Key.endsWith("/")) {
          objects.push(item);
        }
      }
    }
    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

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
  let completedCount = 0;
  let downloadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let downloadedBytes = 0;

  async function downloadObject(item) {
    const key = item.Key;
    const destPath = path.join(targetDir, key);

    try {
      // Check if file already exists with same size
      if (!options.force && fs.existsSync(destPath)) {
        const stats = fs.statSync(destPath);
        if (stats.size === item.Size) {
          skippedCount++;
          completedCount++;
          return;
        }
      }

      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      const getCommand = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await s3Client.send(getCommand);
      const writeStream = fs.createWriteStream(destPath);

      if (response.Body instanceof Readable) {
        await pipeline(response.Body, writeStream);
      } else if (
        response.Body &&
        typeof response.Body.transformToWebStream === "function"
      ) {
        await pipeline(
          Readable.fromWeb(response.Body.transformToWebStream()),
          writeStream,
        );
      } else {
        throw new Error("Unsupported S3 response body stream");
      }

      downloadedCount++;
      downloadedBytes += item.Size || 0;
      completedCount++;

      const percent = ((completedCount / objects.length) * 100).toFixed(1);
      process.stdout.write(
        `\r⏳ [${completedCount}/${objects.length}] (${percent}%) - ${path.basename(key).slice(0, 40)}`,
      );
    } catch (err) {
      failedCount++;
      completedCount++;
      console.error(`\n❌ Failed to download '${key}': ${err.message}`);
    }
  }

  // Worker pool queue
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

  const duration = Date.now() - startTime;
  process.stdout.write("\r" + " ".repeat(80) + "\r"); // Clear progress line

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
    const archivePath = `${targetDir}.tar.gz`;
    console.log(`\n⏳ Compressing backup to ${archivePath} ...`);
    const parentDir = path.dirname(targetDir);
    const folderName = path.basename(targetDir);

    try {
      execFileSync("tar", ["-czf", archivePath, "-C", parentDir, folderName], {
        stdio: "inherit",
      });

      const archiveStats = fs.statSync(archivePath);
      console.log(
        `📦 Archive created: ${archivePath} (${formatBytes(archiveStats.size)})`,
      );

      if (options.cleanDir) {
        console.log(`🧹 Removing uncompressed directory ${targetDir} ...`);
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
    } catch (archiveErr) {
      console.error(`❌ Archive compression failed: ${archiveErr.message}`);
    }
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
