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
  CopyObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
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
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
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

const COPY_VALUE_FLAGS = {
  "--from": "fromEnv",
  "--to": "toEnv",
  "--from-env-file": "fromEnvFile",
  "--to-env-file": "toEnvFile",
  "--from-bucket": "fromBucket",
  "--to-bucket": "toBucket",
  "-p": "prefix",
  "--prefix": "prefix",
  "--target-prefix": "targetPrefix",
  "-c": "concurrency",
  "--concurrency": "concurrency",
};

const COPY_BOOLEAN_FLAGS = {
  "--dry-run": "dryRun",
  "-f": "force",
  "--force": "force",
  "-y": "yes",
  "--yes": "yes",
};

function setCopyOption(options, key, value) {
  options[key] = key === "concurrency" ? parseInt(value, 10) || 10 : value;
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
    }

    if (arg in COPY_BOOLEAN_FLAGS) {
      options[COPY_BOOLEAN_FLAGS[arg]] = true;
      continue;
    }

    if (arg in COPY_VALUE_FLAGS) {
      setCopyOption(options, COPY_VALUE_FLAGS[arg], args[++i]);
      continue;
    }

    const eqIndex = arg.indexOf("=");
    if (eqIndex !== -1) {
      const flag = arg.slice(0, eqIndex);
      if (flag in COPY_VALUE_FLAGS) {
        setCopyOption(options, COPY_VALUE_FLAGS[flag], arg.slice(eqIndex + 1));
      }
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

function resolveCopySideConfig(explicitBucket, env, role) {
  const bucket = explicitBucket || env.S3_BUCKET || env.R2_BUCKET;
  if (!bucket) {
    console.error(`❌ Error: ${role.label} S3 bucket is not specified.`);
    console.error(`Use ${role.usageHint}.`);
    process.exit(1);
  }

  const accessKeyId =
    env.S3_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    env.S3_SECRET || env.S3_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY;

  if (!(accessKeyId && secretAccessKey)) {
    console.error(`❌ Error: ${role.label} S3 credentials missing.`);
    process.exit(1);
  }

  const endpoint = normalizeEndpoint(
    env.S3_ENDPOINT || env.R2_ENDPOINT || env.AWS_ENDPOINT_URL_S3,
    bucket,
  );
  const client = new S3Client({
    region: env.S3_REGION || "auto",
    endpoint: endpoint || undefined,
    credentials: { accessKeyId, secretAccessKey },
  });

  return { bucket, endpoint, accessKeyId, client };
}

function resolveCopySetup(options) {
  const fromFileEnv = loadEnvConfig(options.fromEnv, options.fromEnvFile);
  const fromEnv = { ...process.env, ...fromFileEnv };

  // Default to source credentials if only --to-bucket is passed
  const toFileEnv =
    options.toEnv || options.toEnvFile
      ? loadEnvConfig(options.toEnv, options.toEnvFile)
      : fromFileEnv;
  const toEnv = { ...process.env, ...toFileEnv };

  const source = resolveCopySideConfig(options.fromBucket, fromEnv, {
    label: "Source",
    usageHint: "--from <env> or --from-bucket <name>",
  });
  const dest = resolveCopySideConfig(options.toBucket, toEnv, {
    label: "Destination",
    usageHint: "--to <env> or --to-bucket <name>",
  });

  if (source.bucket === dest.bucket && !options.targetPrefix) {
    console.error("❌ Error: Source and destination buckets are identical.");
    console.error(
      "Specify different buckets or use --target-prefix to avoid overwriting.",
    );
    process.exit(1);
  }

  return {
    source,
    dest,
    canAttemptServerSideCopy:
      source.endpoint === dest.endpoint &&
      source.accessKeyId === dest.accessKeyId,
  };
}

async function listSourceObjects(srcClient, srcBucket, prefix) {
  const srcObjects = [];
  let continuationToken;

  do {
    const res = await srcClient.send(
      new ListObjectsV2Command({
        Bucket: srcBucket,
        Prefix: prefix || undefined,
        ContinuationToken: continuationToken,
      }),
    );
    for (const item of res.Contents ?? []) {
      if (!item.Key.endsWith("/")) {
        srcObjects.push(item);
      }
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return srcObjects;
}

async function listDestinationKeySizes(destClient, destBucket, prefix) {
  const destExistingKeys = new Map();
  let continuationToken;

  try {
    do {
      const res = await destClient.send(
        new ListObjectsV2Command({
          Bucket: destBucket,
          Prefix: prefix || undefined,
          ContinuationToken: continuationToken,
        }),
      );
      for (const item of res.Contents ?? []) {
        destExistingKeys.set(item.Key, item.Size || 0);
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

  return destExistingKeys;
}

async function tryServerSideCopy({
  destClient,
  srcBucket,
  destBucket,
  srcKey,
  destKey,
}) {
  try {
    await destClient.send(
      new CopyObjectCommand({
        Bucket: destBucket,
        Key: destKey,
        CopySource: `${srcBucket}/${encodeURIComponent(srcKey)}`,
        ContentType: getContentType(srcKey),
      }),
    );
    return true;
  } catch {
    // Server-side copy might not be permitted; fallback to streaming
    return false;
  }
}

async function streamCopyObject({
  srcClient,
  destClient,
  srcBucket,
  destBucket,
  srcKey,
  destKey,
}) {
  const getRes = await srcClient.send(
    new GetObjectCommand({ Bucket: srcBucket, Key: srcKey }),
  );
  const bodyBuffer = await streamToBuffer(getRes.Body);

  await destClient.send(
    new PutObjectCommand({
      Bucket: destBucket,
      Key: destKey,
      Body: bodyBuffer,
      ContentType: getRes.ContentType || getContentType(srcKey),
    }),
  );
}

async function copyObjectsConcurrently({
  source,
  dest,
  srcObjects,
  destExistingKeys,
  canAttemptServerSideCopy,
  options,
}) {
  const stats = {
    completedCount: 0,
    copiedCount: 0,
    skippedCount: 0,
    failedCount: 0,
    copiedBytes: 0,
  };

  async function copyObject(item) {
    const srcKey = item.Key;
    const destKey = options.targetPrefix
      ? `${options.targetPrefix.replace(/\/$/, "")}/${srcKey}`
      : srcKey;

    try {
      if (
        !options.force &&
        destExistingKeys.has(destKey) &&
        destExistingKeys.get(destKey) === item.Size
      ) {
        stats.skippedCount++;
        stats.completedCount++;
        return;
      }

      if (options.dryRun) {
        stats.copiedCount++;
        stats.copiedBytes += item.Size || 0;
        stats.completedCount++;
        return;
      }

      const transferParams = {
        srcClient: source.client,
        destClient: dest.client,
        srcBucket: source.bucket,
        destBucket: dest.bucket,
        srcKey,
        destKey,
      };
      const copiedServerSide =
        canAttemptServerSideCopy && (await tryServerSideCopy(transferParams));

      if (!copiedServerSide) {
        await streamCopyObject(transferParams);
      }

      stats.copiedCount++;
      stats.copiedBytes += item.Size || 0;
      stats.completedCount++;

      const percent = (
        (stats.completedCount / srcObjects.length) *
        100
      ).toFixed(1);
      process.stdout.write(
        `\r⏳ [${stats.completedCount}/${srcObjects.length}] (${percent}%) - ${path.basename(destKey).slice(0, 40)}`,
      );
    } catch (err) {
      stats.failedCount++;
      stats.completedCount++;
      console.error(
        `\n❌ Failed copying '${srcKey}' -> '${destKey}': ${err.message}`,
      );
    }
  }

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

  return stats;
}

function printCopyHeader({ source, dest, canAttemptServerSideCopy, options }) {
  console.log(`\n========================================`);
  console.log(`🚀 Starting S3 Bucket-to-Bucket Copy`);
  console.log(`========================================`);
  console.log(`📤 Source Bucket:      ${source.bucket}`);
  console.log(`🌐 Source Endpoint:    ${source.endpoint || "AWS Default"}`);
  console.log(`📥 Target Bucket:      ${dest.bucket}`);
  console.log(`🌐 Target Endpoint:    ${dest.endpoint || "AWS Default"}`);
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
}

function printCopySummary({
  duration,
  copiedCount,
  skippedCount,
  failedCount,
  copiedBytes,
  destBucket,
  dryRun,
}) {
  console.log(`\n========================================`);
  console.log(`✅ Copy Completed in ${formatDuration(duration)}`);
  console.log(`========================================`);
  console.log(
    `📤 Copied:     ${copiedCount} files (${formatBytes(copiedBytes)})${dryRun ? " [DRY RUN]" : ""}`,
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
}

async function main() {
  const options = parseArgs();
  const { source, dest, canAttemptServerSideCopy } = resolveCopySetup(options);

  printCopyHeader({ source, dest, canAttemptServerSideCopy, options });

  // Step 1: List objects in source bucket
  console.log(`⏳ Listing objects from source bucket '${source.bucket}'...`);
  const srcObjects = await listSourceObjects(
    source.client,
    source.bucket,
    options.prefix,
  );

  if (srcObjects.length === 0) {
    console.log(`⚠️ No objects found in source bucket '${source.bucket}'.`);
    return;
  }

  const totalBytes = srcObjects.reduce((acc, o) => acc + (o.Size || 0), 0);
  console.log(
    `📦 Found ${srcObjects.length} objects in source (Total: ${formatBytes(totalBytes)})`,
  );

  // Safety confirmation check
  if (!(options.yes || options.dryRun)) {
    const confirmed = await confirmPrompt(
      `⚠️ Confirm copying ${srcObjects.length} objects (${formatBytes(totalBytes)}) from '${source.bucket}' to '${dest.bucket}'?`,
    );
    if (!confirmed) {
      console.log("Operation cancelled by user.");
      process.exit(0);
    }
  }

  // Step 2: Query destination bucket for existing objects
  console.log(
    `⏳ Querying destination bucket '${dest.bucket}' for existing keys...`,
  );
  const destExistingKeys = await listDestinationKeySizes(
    dest.client,
    dest.bucket,
    options.targetPrefix || options.prefix,
  );

  // Step 3: Copy objects concurrently
  const startTime = Date.now();
  const { copiedCount, skippedCount, failedCount, copiedBytes } =
    await copyObjectsConcurrently({
      source,
      dest,
      srcObjects,
      destExistingKeys,
      canAttemptServerSideCopy,
      options,
    });

  const duration = Date.now() - startTime;
  process.stdout.write(`\r${" ".repeat(80)}\r`);

  printCopySummary({
    duration,
    copiedCount,
    skippedCount,
    failedCount,
    copiedBytes,
    destBucket: dest.bucket,
    dryRun: options.dryRun,
  });

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\n❌ Fatal copy error:", err);
  process.exit(1);
});
