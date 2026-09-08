#!/usr/bin/env node

/**
 * S3 / Cloudflare R2 Restore Script
 *
 * Restores / uploads media files from a local directory or tar.gz archive to an S3/R2 bucket.
 * Automatically loads credentials from .env files or CLI parameters.
 * Supports concurrent uploads, resume/skip existing files, auto-extracting archives, and dry-run mode.
 *
 * Usage:
 *   node scripts/s3-restore.mjs [source] [options]
 *   pnpm s3:restore [source] [options]
 *
 * Examples:
 *   pnpm s3:restore
 *   pnpm s3:restore tmp/backups/s3_daminhgovap_backup.tar.gz --env staging
 *   pnpm s3:restore ./media --env production --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEFAULT_BACKUP_DIR = path.join(PROJECT_ROOT, "tmp", "backups");

/**
 * Common MIME types dictionary for automatic Content-Type detection.
 */
const MIME_TYPES = {
  // Images
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  // Audio & Video
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  // Documents & Data
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".txt": "text/plain",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".zip": "application/zip",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
};

/**
 * Get Content-Type for a filename.
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

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
 * Format milliseconds to readable string.
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
 * Find the latest backup directory or archive in tmp/backups.
 */
function findLatestBackup() {
  if (!fs.existsSync(DEFAULT_BACKUP_DIR)) {
    return null;
  }

  const entries = fs
    .readdirSync(DEFAULT_BACKUP_DIR, { withFileTypes: true })
    .filter((entry) => {
      if (entry.name.startsWith(".")) return false;
      return (
        entry.isDirectory() ||
        entry.name.endsWith(".tar.gz") ||
        entry.name.endsWith(".tgz")
      );
    })
    .map((entry) => {
      const fullPath = path.join(DEFAULT_BACKUP_DIR, entry.name);
      return {
        path: fullPath,
        name: entry.name,
        mtime: fs.statSync(fullPath).mtimeMs,
      };
    })
    .sort((a, b) => b.mtime - a.mtime);

  return entries.length > 0 ? entries[0].path : null;
}

/**
 * Recursively collect all files within a directory.
 */
function getAllFiles(dir, baseDir = dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      const relativeKey = path.relative(baseDir, fullPath).replace(/\\/g, "/"); // normalize Windows paths
      const size = fs.statSync(fullPath).size;
      files.push({ fullPath, relativeKey, size });
    }
  }

  return files;
}

/**
 * Ask user for yes/no confirmation.
 */
async function confirmPrompt(question) {
  if (!process.stdin.isTTY) {
    return true;
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(
        answer.trim().toLowerCase() === "y" ||
          answer.trim().toLowerCase() === "yes",
      );
    });
  });
}

/**
 * Print CLI help and exit.
 */
function printHelp() {
  console.log(`
📦 S3 / Cloudflare R2 Restore Script

Usage:
  node scripts/s3-restore.mjs [source] [options]
  pnpm s3:restore [source] [options]

Arguments:
  source                   Path to backup directory or .tar.gz archive (default: latest in tmp/backups)

Options:
  -e, --env <name>         Environment name (e.g. production, staging, local)
  --env-file <path>        Path to custom .env file
  -b, --bucket <name>      Override destination S3 bucket name
  -p, --prefix <prefix>    Prefix to prepend to uploaded keys (e.g. media/)
  -s, --src <path>         Explicit source directory or archive
  -c, --concurrency <num>  Number of concurrent uploads (default: 10)
  --dry-run                Simulate upload without writing to S3
  -f, --force              Re-upload files even if size matches in bucket
  -y, --yes                Skip confirmation prompt
  -h, --help               Show this help message

Environment Variables:
  S3_BUCKET / R2_BUCKET
  S3_ACCESS_KEY_ID / R2_ACCESS_KEY_ID / AWS_ACCESS_KEY_ID
  S3_SECRET / S3_SECRET_ACCESS_KEY / R2_SECRET_ACCESS_KEY / AWS_SECRET_ACCESS_KEY
  S3_ENDPOINT / R2_ENDPOINT / AWS_ENDPOINT_URL_S3
  S3_REGION (default: "auto")

Examples:
  pnpm s3:restore
  pnpm s3:restore tmp/backups/s3_daminhgovap_backup.tar.gz
  pnpm s3:restore ./my-media --env staging --dry-run
  pnpm s3:restore ./my-media --bucket my-alt-bucket --yes
`);
}

/**
 * Parse CLI options.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    source: "",
    envName: "",
    envFile: "",
    bucket: "",
    prefix: "",
    concurrency: 10,
    dryRun: false,
    force: false,
    yes: false,
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
    } else if (arg === "-s" || arg === "--src" || arg === "--source") {
      options.source = args[++i];
    } else if (arg.startsWith("--src=")) {
      options.source = arg.split("=")[1];
    } else if (arg === "-c" || arg === "--concurrency") {
      options.concurrency = parseInt(args[++i], 10) || 10;
    } else if (arg.startsWith("--concurrency=")) {
      options.concurrency = parseInt(arg.split("=")[1], 10) || 10;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "-f" || arg === "--force") {
      options.force = true;
    } else if (arg === "-y" || arg === "--yes") {
      options.yes = true;
    } else if (!arg.startsWith("-")) {
      // Positional argument: either environment name or source path
      if (
        fs.existsSync(arg) ||
        arg.endsWith(".tar.gz") ||
        arg.includes("/") ||
        arg.includes("\\")
      ) {
        options.source = arg;
      } else if (!options.envName) {
        options.envName = arg;
      }
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
  const env = { ...process.env, ...fileEnv };

  // Resolve source
  let sourcePath = options.source;
  if (!sourcePath) {
    const latest = findLatestBackup();
    if (latest) {
      sourcePath = latest;
      console.log(
        `ℹ️ No source provided. Using latest backup: ${path.relative(PROJECT_ROOT, sourcePath)}`,
      );
    } else {
      console.error(
        "❌ Error: No source backup provided and none found in tmp/backups.",
      );
      console.error("Usage: pnpm s3:restore <path-to-folder-or-tar.gz>");
      process.exit(1);
    }
  }

  sourcePath = path.resolve(sourcePath);
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Error: Source path not found: ${sourcePath}`);
    process.exit(1);
  }

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
    console.error("❌ Error: Target S3 Bucket is not specified.");
    console.error("Please set S3_BUCKET in your .env or pass --bucket <name>.");
    process.exit(1);
  }

  if (!accessKeyId || !secretAccessKey) {
    console.error("❌ Error: S3 credentials are missing.");
    console.error("Please set S3_ACCESS_KEY_ID and S3_SECRET in your .env.");
    process.exit(1);
  }

  // Handle archive extraction if source is a tar.gz / tar
  let workingDir = sourcePath;
  let tempExtractedDir = null;

  const isArchive =
    sourcePath.endsWith(".tar.gz") ||
    sourcePath.endsWith(".tgz") ||
    sourcePath.endsWith(".tar");

  if (isArchive) {
    const tempDirName = `restore_temp_${Date.now()}`;
    tempExtractedDir = path.join(PROJECT_ROOT, "tmp", tempDirName);
    fs.mkdirSync(tempExtractedDir, { recursive: true });

    console.log(
      `⏳ Extracting archive ${path.basename(sourcePath)} to temporary folder...`,
    );
    try {
      execFileSync("tar", ["-xzf", sourcePath, "-C", tempExtractedDir], {
        stdio: "inherit",
      });
      // Check if tar extracted a single top-level folder
      const items = fs.readdirSync(tempExtractedDir);
      if (
        items.length === 1 &&
        fs.statSync(path.join(tempExtractedDir, items[0])).isDirectory()
      ) {
        workingDir = path.join(tempExtractedDir, items[0]);
      } else {
        workingDir = tempExtractedDir;
      }
      console.log(`✅ Archive extracted successfully.`);
    } catch (err) {
      console.error(`❌ Failed to extract archive: ${err.message}`);
      if (tempExtractedDir && fs.existsSync(tempExtractedDir)) {
        fs.rmSync(tempExtractedDir, { recursive: true, force: true });
      }
      process.exit(1);
    }
  }

  // Collect all local files to upload
  const filesToUpload = getAllFiles(workingDir);
  if (filesToUpload.length === 0) {
    console.log(`⚠️ No files found in source: ${workingDir}`);
    if (tempExtractedDir && fs.existsSync(tempExtractedDir)) {
      fs.rmSync(tempExtractedDir, { recursive: true, force: true });
    }
    return;
  }

  const totalLocalBytes = filesToUpload.reduce((sum, f) => sum + f.size, 0);

  console.log(`\n========================================`);
  console.log(`🚀 Starting S3 Restore`);
  console.log(`========================================`);
  console.log(`🪣  Target Bucket:  ${bucket}`);
  console.log(`🌐 Endpoint:       ${endpoint || "AWS Default"}`);
  console.log(`📍 Region:         ${region}`);
  if (options.prefix) {
    console.log(`🔍 Key Prefix:     ${options.prefix}`);
  }
  console.log(`📁 Source:         ${sourcePath}`);
  console.log(
    `📦 Files to Check: ${filesToUpload.length} (${formatBytes(totalLocalBytes)})`,
  );
  console.log(`⚡ Concurrency:    ${options.concurrency}`);
  if (options.dryRun) {
    console.log(`🔍 Mode:           DRY RUN (No files will be written)`);
  }
  console.log(`========================================\n`);

  // Confirmation safety check
  if (!options.yes && !options.dryRun) {
    const confirmed = await confirmPrompt(
      `⚠️ Are you sure you want to restore ${filesToUpload.length} files to bucket '${bucket}'?`,
    );
    if (!confirmed) {
      console.log("Restoration aborted by user.");
      if (tempExtractedDir && fs.existsSync(tempExtractedDir)) {
        fs.rmSync(tempExtractedDir, { recursive: true, force: true });
      }
      process.exit(0);
    }
  }

  const s3Client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  // Step 1: Query existing objects in the bucket to skip identical files
  console.log(`⏳ Querying existing objects in bucket '${bucket}'...`);
  const existingBucketKeys = new Map(); // key -> size
  let continuationToken = undefined;

  try {
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: options.prefix || undefined,
        ContinuationToken: continuationToken,
      });
      const listRes = await s3Client.send(listCommand);
      if (listRes.Contents) {
        for (const item of listRes.Contents) {
          existingBucketKeys.set(item.Key, item.Size || 0);
        }
      }
      continuationToken = listRes.NextContinuationToken;
    } while (continuationToken);

    console.log(
      `ℹ️ Found ${existingBucketKeys.size} existing objects in bucket.`,
    );
  } catch (listErr) {
    console.warn(
      `⚠️ Warning: Could not list remote objects (${listErr.message}). Will upload without pre-filtering.`,
    );
  }

  // Step 2: Upload files
  const startTime = Date.now();
  let completedCount = 0;
  let uploadedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let uploadedBytes = 0;

  async function uploadFile(fileItem) {
    const s3Key = options.prefix
      ? `${options.prefix.replace(/\/$/, "")}/${fileItem.relativeKey}`
      : fileItem.relativeKey;

    try {
      // Check if file exists in bucket with identical size
      if (!options.force && existingBucketKeys.has(s3Key)) {
        const existingSize = existingBucketKeys.get(s3Key);
        if (existingSize === fileItem.size) {
          skippedCount++;
          completedCount++;
          return;
        }
      }

      if (options.dryRun) {
        uploadedCount++;
        uploadedBytes += fileItem.size;
        completedCount++;
        return;
      }

      const fileBuffer = fs.readFileSync(fileItem.fullPath);
      const contentType = getContentType(fileItem.fullPath);

      const putCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await s3Client.send(putCommand);

      uploadedCount++;
      uploadedBytes += fileItem.size;
      completedCount++;

      const percent = ((completedCount / filesToUpload.length) * 100).toFixed(
        1,
      );
      process.stdout.write(
        `\r⏳ [${completedCount}/${filesToUpload.length}] (${percent}%) - ${path.basename(s3Key).slice(0, 40)}`,
      );
    } catch (err) {
      failedCount++;
      completedCount++;
      console.error(`\n❌ Failed to upload '${s3Key}': ${err.message}`);
    }
  }

  // Worker pool queue
  const concurrency = Math.max(1, options.concurrency);
  let queueIndex = 0;

  async function worker() {
    while (queueIndex < filesToUpload.length) {
      const currentItem = filesToUpload[queueIndex++];
      await uploadFile(currentItem);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, filesToUpload.length) },
    () => worker(),
  );
  await Promise.all(workers);

  const duration = Date.now() - startTime;
  process.stdout.write("\r" + " ".repeat(80) + "\r");

  // Clean up temporary extracted folder if one was created
  if (tempExtractedDir && fs.existsSync(tempExtractedDir)) {
    console.log(`🧹 Cleaning up temporary extraction directory...`);
    fs.rmSync(tempExtractedDir, { recursive: true, force: true });
  }

  console.log(`\n========================================`);
  console.log(`✅ Restore Completed in ${formatDuration(duration)}`);
  console.log(`========================================`);
  console.log(
    `📤 Uploaded:   ${uploadedCount} files (${formatBytes(uploadedBytes)})${options.dryRun ? " [DRY RUN]" : ""}`,
  );
  if (skippedCount > 0) {
    console.log(
      `⏭️  Skipped:    ${skippedCount} files (already identical in bucket)`,
    );
  }
  if (failedCount > 0) {
    console.log(`❌ Failed:     ${failedCount} files`);
  }
  console.log(`🪣  Target:     ${bucket}`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal restore error:", err);
  process.exit(1);
});
