#!/usr/bin/env node

/**
 * S3 / Cloudflare R2 Bucket-to-Bucket Copy Script
 *
 * Copies objects directly from a source bucket to a target bucket.
 * Supports:
 * - Server-side copy (fastest, when buckets share the same S3 endpoint/account)
 * - Streamed in-memory copy (when copying across different endpoints or accounts, without saving to disk)
 * - Smart skip (skips files already in the target bucket with matching size)
 * - Environment switching (--from production --to staging)
 * - Concurrency control, dry-run mode, and prefix filtering
 *
 * Usage:
 *   node scripts/s3-copy.mjs [options]
 *   pnpm s3:copy [options]
 *
 * Examples:
 *   pnpm s3:copy --from production --to staging
 *   pnpm s3:copy --from-bucket daminhgovap --to-bucket my-backup-bucket
 *   pnpm s3:copy --from production --to staging --prefix media/ --dry-run
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

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

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDuration(ms) {
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

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

function loadEnvConfig(envName, explicitFile) {
  if (explicitFile) {
    const fullPath = path.isAbsolute(explicitFile)
      ? explicitFile
      : path.resolve(PROJECT_ROOT, explicitFile);
    if (fs.existsSync(fullPath)) {
      return parseEnvFile(fullPath);
    }
    console.error(`❌ Error: Specified env file not found: ${explicitFile}`);
    process.exit(1);
  }

  const candidates = [];
  if (envName) {
    const normalized = envName.toLowerCase().replace(/^\./, "");
    candidates.push(
      path.join(PROJECT_ROOT, `.env.${normalized}`),
      path.join(PROJECT_ROOT, `.env.${normalized}.local`),
    );
  }

  candidates.push(
    path.join(PROJECT_ROOT, ".env.local"),
    path.join(PROJECT_ROOT, ".env"),
    path.join(PROJECT_ROOT, ".env.production"),
    path.join(PROJECT_ROOT, ".env.staging"),
  );

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return parseEnvFile(candidate);
    }
  }

  return {};
}

async function confirmPrompt(question) {
  if (!process.stdin.isTTY) return true;
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

function printHelp() {
  console.log(`
📦 S3 / Cloudflare R2 Bucket-to-Bucket Copy Script

Usage:
  node scripts/s3-copy.mjs [options]
  pnpm s3:copy [options]

Options:
  --from <env>             Source environment name (e.g. production, default)
  --to <env>               Destination environment name (e.g. staging)
  --from-env-file <path>   Source .env file path
  --to-env-file <path>     Destination .env file path
  --from-bucket <name>     Source S3 bucket name
  --to-bucket <name>       Destination S3 bucket name
  -p, --prefix <prefix>    Source key prefix to filter objects
  --target-prefix <prefix> Prefix to prepend to copied keys in target bucket
  -c, --concurrency <num>  Concurrent copy operations (default: 10)
  --dry-run                Simulate copy without writing to destination bucket
  -f, --force              Re-copy files even if size matches in target bucket
  -y, --yes                Skip confirmation prompt
  -h, --help               Show this help message

Examples:
  pnpm s3:copy --from production --to staging
  pnpm s3:copy --from-bucket daminhgovap --to-bucket daminhgovap-staging
  pnpm s3:copy --from production --to staging --prefix media/ --dry-run
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    fromEnv: "",
    toEnv: "",
    fromEnvFile: "",
    toEnvFile: "",
    fromBucket: "",
    toBucket: "",
    prefix: "",
    targetPrefix: "",
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
    } else if (arg === "--from") {
      options.fromEnv = args[++i];
    } else if (arg.startsWith("--from=")) {
      options.fromEnv = arg.split("=")[1];
    } else if (arg === "--to") {
      options.toEnv = args[++i];
    } else if (arg.startsWith("--to=")) {
      options.toEnv = arg.split("=")[1];
    } else if (arg === "--from-env-file") {
      options.fromEnvFile = args[++i];
    } else if (arg === "--to-env-file") {
      options.toEnvFile = args[++i];
    } else if (arg === "--from-bucket") {
      options.fromBucket = args[++i];
    } else if (arg === "--to-bucket") {
      options.toBucket = args[++i];
    } else if (arg === "-p" || arg === "--prefix") {
      options.prefix = args[++i];
    } else if (arg === "--target-prefix") {
      options.targetPrefix = args[++i];
    } else if (arg === "-c" || arg === "--concurrency") {
      options.concurrency = parseInt(args[++i], 10) || 10;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "-f" || arg === "--force") {
      options.force = true;
    } else if (arg === "-y" || arg === "--yes") {
      options.yes = true;
    }
  }

  return options;
}

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function main() {
  const options = parseArgs();

  // Load Source Configuration
  const fromFileEnv = loadEnvConfig(options.fromEnv, options.fromEnvFile);
  const fromEnv = { ...process.env, ...fromFileEnv };

  // Load Destination Configuration
  const toFileEnv =
    options.toEnv || options.toEnvFile
      ? loadEnvConfig(options.toEnv, options.toEnvFile)
      : fromFileEnv; // default to same credentials if only to-bucket is passed
  const toEnv = { ...process.env, ...toFileEnv };

  const srcBucket =
    options.fromBucket || fromEnv.S3_BUCKET || fromEnv.R2_BUCKET;
  const destBucket = options.toBucket || toEnv.S3_BUCKET || toEnv.R2_BUCKET;

  if (!srcBucket) {
    console.error("❌ Error: Source S3 bucket is not specified.");
    console.error("Use --from <env> or --from-bucket <name>.");
    process.exit(1);
  }

  if (!destBucket) {
    console.error("❌ Error: Destination S3 bucket is not specified.");
    console.error("Use --to <env> or --to-bucket <name>.");
    process.exit(1);
  }

  if (srcBucket === destBucket && !options.targetPrefix) {
    console.error("❌ Error: Source and destination buckets are identical.");
    console.error(
      "Specify different buckets or use --target-prefix to avoid overwriting.",
    );
    process.exit(1);
  }

  const srcEndpoint =
    fromEnv.S3_ENDPOINT || fromEnv.R2_ENDPOINT || fromEnv.AWS_ENDPOINT_URL_S3;
  const destEndpoint =
    toEnv.S3_ENDPOINT || toEnv.R2_ENDPOINT || toEnv.AWS_ENDPOINT_URL_S3;

  const srcAccessKey =
    fromEnv.S3_ACCESS_KEY_ID ||
    fromEnv.R2_ACCESS_KEY_ID ||
    fromEnv.AWS_ACCESS_KEY_ID;
  const srcSecret =
    fromEnv.S3_SECRET ||
    fromEnv.S3_SECRET_ACCESS_KEY ||
    fromEnv.R2_SECRET_ACCESS_KEY;

  const destAccessKey =
    toEnv.S3_ACCESS_KEY_ID || toEnv.R2_ACCESS_KEY_ID || toEnv.AWS_ACCESS_KEY_ID;
  const destSecret =
    toEnv.S3_SECRET || toEnv.S3_SECRET_ACCESS_KEY || toEnv.R2_SECRET_ACCESS_KEY;

  if (!srcAccessKey || !srcSecret) {
    console.error("❌ Error: Source S3 credentials missing.");
    process.exit(1);
  }

  if (!destAccessKey || !destSecret) {
    console.error("❌ Error: Destination S3 credentials missing.");
    process.exit(1);
  }

  const srcClient = new S3Client({
    region: fromEnv.S3_REGION || "auto",
    endpoint: srcEndpoint || undefined,
    credentials: {
      accessKeyId: srcAccessKey,
      secretAccessKey: srcSecret,
    },
  });

  const destClient = new S3Client({
    region: toEnv.S3_REGION || "auto",
    endpoint: destEndpoint || undefined,
    credentials: {
      accessKeyId: destAccessKey,
      secretAccessKey: destSecret,
    },
  });

  // Check if same endpoint & account (server-side copy candidate)
  const canAttemptServerSideCopy =
    srcEndpoint === destEndpoint && srcAccessKey === destAccessKey;

  console.log(`\n========================================`);
  console.log(`🚀 Starting S3 Bucket-to-Bucket Copy`);
  console.log(`========================================`);
  console.log(`📤 Source Bucket:      ${srcBucket}`);
  console.log(`🌐 Source Endpoint:    ${srcEndpoint || "AWS Default"}`);
  console.log(`📥 Target Bucket:      ${destBucket}`);
  console.log(`🌐 Target Endpoint:    ${destEndpoint || "AWS Default"}`);
  console.log(
    `⚡ Mode:               ${canAttemptServerSideCopy ? "Server-side (Fastest) with Stream Fallback" : "Direct In-Memory Streaming"}`,
  );
  if (options.prefix) {
    console.log(`🔍 Prefix:             ${options.prefix}`);
  }
  if (options.targetPrefix) {
    console.log(`🏷️  Target Prefix:      ${options.targetPrefix}`);
  }
  console.log(`🔄 Concurrency:        ${options.concurrency}`);
  if (options.dryRun) {
    console.log(`🔍 Dry Run:            YES (No files will be modified)`);
  }
  console.log(`========================================\n`);

  // Step 1: List objects in source bucket
  console.log(`⏳ Listing objects from source bucket '${srcBucket}'...`);
  const srcObjects = [];
  let continuationToken = undefined;

  do {
    const listCmd = new ListObjectsV2Command({
      Bucket: srcBucket,
      Prefix: options.prefix || undefined,
      ContinuationToken: continuationToken,
    });
    const res = await srcClient.send(listCmd);
    if (res.Contents) {
      for (const item of res.Contents) {
        if (!item.Key.endsWith("/")) {
          srcObjects.push(item);
        }
      }
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  if (srcObjects.length === 0) {
    console.log(`⚠️ No objects found in source bucket '${srcBucket}'.`);
    return;
  }

  const totalBytes = srcObjects.reduce((acc, o) => acc + (o.Size || 0), 0);
  console.log(
    `📦 Found ${srcObjects.length} objects in source (Total: ${formatBytes(totalBytes)})`,
  );

  // Safety confirmation check
  if (!options.yes && !options.dryRun) {
    const confirmed = await confirmPrompt(
      `⚠️ Confirm copying ${srcObjects.length} objects (${formatBytes(totalBytes)}) from '${srcBucket}' to '${destBucket}'?`,
    );
    if (!confirmed) {
      console.log("Operation cancelled by user.");
      process.exit(0);
    }
  }

  // Step 2: Query destination bucket for existing objects
  console.log(
    `⏳ Querying destination bucket '${destBucket}' for existing keys...`,
  );
  const destExistingKeys = new Map();
  continuationToken = undefined;

  try {
    do {
      const listCmd = new ListObjectsV2Command({
        Bucket: destBucket,
        Prefix: options.targetPrefix || options.prefix || undefined,
        ContinuationToken: continuationToken,
      });
      const res = await destClient.send(listCmd);
      if (res.Contents) {
        for (const item of res.Contents) {
          destExistingKeys.set(item.Key, item.Size || 0);
        }
      }
      continuationToken = res.NextContinuationToken;
    } while (continuationToken);
    console.log(
      `ℹ️ Found ${destExistingKeys.size} existing objects in target bucket.`,
    );
  } catch (err) {
    console.warn(
      `⚠️ Warning: Could not pre-query target bucket (${err.message}). Will copy directly.`,
    );
  }

  // Step 3: Copy objects concurrently
  const startTime = Date.now();
  let completedCount = 0;
  let copiedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let copiedBytes = 0;

  async function copyObject(item) {
    const srcKey = item.Key;
    const destKey = options.targetPrefix
      ? `${options.targetPrefix.replace(/\/$/, "")}/${srcKey}`
      : srcKey;

    try {
      // Check if file exists in destination with identical size
      if (!options.force && destExistingKeys.has(destKey)) {
        if (destExistingKeys.get(destKey) === item.Size) {
          skippedCount++;
          completedCount++;
          return;
        }
      }

      if (options.dryRun) {
        copiedCount++;
        copiedBytes += item.Size || 0;
        completedCount++;
        return;
      }

      let copiedSuccessfully = false;

      // Strategy 1: Server-side S3 Copy (if on same endpoint/account)
      if (canAttemptServerSideCopy) {
        try {
          const copyCmd = new CopyObjectCommand({
            Bucket: destBucket,
            Key: destKey,
            CopySource: `${srcBucket}/${encodeURIComponent(srcKey)}`,
            ContentType: getContentType(srcKey),
          });
          await destClient.send(copyCmd);
          copiedSuccessfully = true;
        } catch (serverSideErr) {
          // Server-side copy might not be permitted; fallback to streaming
        }
      }

      // Strategy 2: Direct in-memory streaming fallback
      if (!copiedSuccessfully) {
        const getCmd = new GetObjectCommand({
          Bucket: srcBucket,
          Key: srcKey,
        });
        const getRes = await srcClient.send(getCmd);
        const bodyBuffer = await streamToBuffer(getRes.Body);

        const putCmd = new PutObjectCommand({
          Bucket: destBucket,
          Key: destKey,
          Body: bodyBuffer,
          ContentType: getRes.ContentType || getContentType(srcKey),
        });
        await destClient.send(putCmd);
      }

      copiedCount++;
      copiedBytes += item.Size || 0;
      completedCount++;

      const percent = ((completedCount / srcObjects.length) * 100).toFixed(1);
      process.stdout.write(
        `\r⏳ [${completedCount}/${srcObjects.length}] (${percent}%) - ${path.basename(destKey).slice(0, 40)}`,
      );
    } catch (err) {
      failedCount++;
      completedCount++;
      console.error(
        `\n❌ Failed copying '${srcKey}' -> '${destKey}': ${err.message}`,
      );
    }
  }

  // Worker pool queue
  const concurrency = Math.max(1, options.concurrency);
  let queueIndex = 0;

  async function worker() {
    while (queueIndex < srcObjects.length) {
      const currentItem = srcObjects[queueIndex++];
      await copyObject(currentItem);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, srcObjects.length) },
    () => worker(),
  );
  await Promise.all(workers);

  const duration = Date.now() - startTime;
  process.stdout.write("\r" + " ".repeat(80) + "\r");

  console.log(`\n========================================`);
  console.log(`✅ Copy Completed in ${formatDuration(duration)}`);
  console.log(`========================================`);
  console.log(
    `📤 Copied:     ${copiedCount} files (${formatBytes(copiedBytes)})${options.dryRun ? " [DRY RUN]" : ""}`,
  );
  if (skippedCount > 0) {
    console.log(
      `⏭️  Skipped:    ${skippedCount} files (already identical in target)`,
    );
  }
  if (failedCount > 0) {
    console.log(`❌ Failed:     ${failedCount} files`);
  }
  console.log(`🪣  Destination: ${destBucket}`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal copy error:", err);
  process.exit(1);
});
