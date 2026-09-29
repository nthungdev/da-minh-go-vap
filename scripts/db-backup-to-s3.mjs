#!/usr/bin/env node

/**
 * Database Backup to S3 / Cloudflare R2
 *
 * Runs mongodump to create a compressed archive of the MongoDB database,
 * then uploads the resulting file to an S3/R2 bucket with retention management.
 *
 * Usage:
 *   node scripts/db-backup-to-s3.mjs [options]
 *   pnpm db:backup:s3 [options]
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const BACKUP_DIR = path.join(PROJECT_ROOT, "tmp", "backups");

/**
 * Loads environment variables from local .env files if not already in process.env.
 */
function loadEnv() {
  const envFiles = [".env.local", ".env", ".env.production"];
  for (const file of envFiles) {
    const fullPath = path.join(PROJECT_ROOT, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const DB_URL =
  process.env.DB_BACKUP_URL ||
  process.env.DATABASE_URI ||
  "mongodb://localhost:27017/da-minh-go-vap";

const BUCKET = process.env.S3_BUCKET;
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const SECRET_KEY = process.env.S3_SECRET;
const ENDPOINT = process.env.S3_ENDPOINT;
const REGION = process.env.S3_REGION || "auto";
const PREFIX = process.env.DB_BACKUP_PREFIX || "backups/database/";

async function main() {
  console.log("🚀 Starting Database Backup to S3...");

  if (!BUCKET || !ACCESS_KEY || !SECRET_KEY) {
    console.error(
      "❌ Error: Missing S3 credentials (S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET).",
    );
    process.exit(1);
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `db-dump-${timestamp}.gz`;
  const localFilePath = path.join(BACKUP_DIR, filename);

  console.log(`⏳ Running mongodump to ${localFilePath}...`);
  try {
    const cmd = `mongodump --uri="${DB_URL}" --archive="${localFilePath}" --gzip`;
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error("❌ mongodump failed:", err.message);
    process.exit(1);
  }

  const stat = fs.statSync(localFilePath);
  const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Database dump created (${sizeMb} MB)`);

  console.log(
    `⏳ Uploading to S3 bucket '${BUCKET}' at '${PREFIX}${filename}'...`,
  );
  const s3 = new S3Client({
    region: REGION,
    endpoint: ENDPOINT || undefined,
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    },
  });

  const fileStream = fs.createReadStream(localFilePath);
  const uploadCommand = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `${PREFIX}${filename}`,
    Body: fileStream,
    ContentType: "application/gzip",
  });

  await s3.send(uploadCommand);
  console.log(
    `✅ Successfully uploaded backup to s3://${BUCKET}/${PREFIX}${filename}`,
  );

  // Clean up local temp dump
  try {
    fs.unlinkSync(localFilePath);
    console.log(`🧹 Cleaned up temporary local file: ${localFilePath}`);
  } catch {
    // Ignore cleanup error
  }
}

main().catch((err) => {
  console.error("❌ Backup failed:", err);
  process.exit(1);
});
