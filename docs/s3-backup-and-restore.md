# S3 & Cloudflare R2 Backup and Restore Guide

This guide documents the backup and restore procedures for S3-compatible object storage (Cloudflare R2 / AWS S3) used by Payload CMS for media uploads in the **Đa Minh Gò Vấp** project.

---

## 1. Overview

Payload CMS stores uploaded media (images, PDFs, audio, video) in an S3-compatible bucket via `@payloadcms/storage-s3`.

To safeguard media assets and support staging/disaster recovery syncs, two scripts are provided:

- **`s3:backup`** (`scripts/s3-backup.sh` / `scripts/s3-backup.mjs`): Downloads objects from the bucket to a local directory or compressed archive.
- **`s3:restore`** (`scripts/s3-restore.sh` / `scripts/s3-restore.mjs`): Restores media files from a local directory or `.tar.gz` archive back to an S3/R2 bucket.

### Key Features

- **No External CLI Dependencies Required**: Runs natively using Node.js and `@aws-sdk/client-s3`. (Optional support for `rclone` and `aws-cli` is also included).
- **Multi-threaded Concurrency**: Configurable parallel workers (default: 10) for fast batch transfers.
- **Incremental Skip & Resume**: Compares file sizes before transferring, skipping identical existing files to save bandwidth and resume interrupted jobs.
- **Archive Automation**: Directly compress backups to `.tar.gz` and automatically unpack archives during restoration.
- **Safe Execution**: Interactive confirmation and `--dry-run` modes to prevent accidental bucket overwrites.

---

## 2. Environment Variables & Configuration

The scripts automatically discover credentials from your project's `.env` files in this priority order:

1. Explicit file specified via `--env-file <path>`
2. Target environment file (`.env.<name>`, e.g. `.env.production`, `.env.staging`, `.env.local`)
3. Root `.env.local`, `.env`, `.env.production`, `.env.staging`

The following environment variables are recognized:

| Variable                                | Description                              | Example                                         |
| :-------------------------------------- | :--------------------------------------- | :---------------------------------------------- |
| `S3_BUCKET` / `R2_BUCKET`               | Target bucket name                       | `daminhgovap`                                   |
| `S3_ACCESS_KEY_ID` / `R2_ACCESS_KEY_ID` | S3 API Access Key ID                     | `faa4cd678...`                                  |
| `S3_SECRET` / `S3_SECRET_ACCESS_KEY`    | S3 API Secret Access Key                 | `d6c9d0de3...`                                  |
| `S3_ENDPOINT` / `R2_ENDPOINT`           | Custom endpoint URL (R2 / MinIO / Local) | `https://<account-id>.r2.cloudflarestorage.com` |
| `S3_REGION`                             | S3 region (default: `"auto"` for R2)     | `auto` or `ap-southeast-1`                      |

---

## 3. Backing Up S3 Data (`s3:backup`)

### Quick Start

```bash
# Back up bucket using default .env
pnpm s3:backup

# Back up production bucket
pnpm s3:backup production

# Back up staging bucket
pnpm s3:backup staging
```

Backups are saved by default to:

```
tmp/backups/s3_<bucket>_<timestamp>/
```

---

### Common Backup Workflows

#### 1. Create a Compressed `.tar.gz` Archive

```bash
# Download and compress into tmp/backups/s3_<bucket>_<timestamp>.tar.gz
pnpm s3:backup --archive

# Keep only the archive (delete the uncompressed directory)
pnpm s3:backup --archive --clean-dir
```

#### 2. Backup a Specific Prefix (Subfolder)

```bash
# Back up only media files starting with "posts/"
pnpm s3:backup --prefix posts/

# Back up a specific single file
pnpm s3:backup --prefix banner.webp
```

#### 3. Custom Output Directory and Concurrency

```bash
# Specify target directory and 16 concurrent download streams
pnpm s3:backup --out ./out/backups/media --concurrency 16
```

#### 4. Force Re-download

```bash
# Re-download all files even if already present locally with the same size
pnpm s3:backup --force
```

---

## 4. Restoring S3 Data (`s3:restore`)

### Quick Start

```bash
# Restores from the most recent backup found in tmp/backups/
pnpm s3:restore

# Restore to staging bucket
pnpm s3:restore --env staging

# Restore to production bucket
pnpm s3:restore production
```

---

### Common Restore Workflows

#### 1. Restore from a Compressed Archive

Archives (`.tar.gz`, `.tgz`, `.tar`) are automatically extracted to a temporary directory, uploaded, and cleaned up:

```bash
pnpm s3:restore tmp/backups/s3_daminhgovap_20260908_162144.tar.gz
```

#### 2. Restore from a Specific Directory

```bash
pnpm s3:restore ./media-backup --env staging
```

#### 3. Dry Run Simulation (Safe Preview)

Simulates what files would be uploaded or skipped without writing anything to S3:

```bash
pnpm s3:restore ./media-backup --env production --dry-run
```

#### 4. Non-Interactive / CI Mode (`--yes`)

Bypasses the interactive confirmation prompt:

```bash
pnpm s3:restore tmp/backups/s3_backup.tar.gz --env staging --yes
```

#### 5. Sync from Production to Staging

A common workflow to replicate production media into a staging environment:

```bash
# Step 1: Backup production
pnpm s3:backup production --out tmp/prod-media

# Step 2: Restore into staging bucket
pnpm s3:restore tmp/prod-media --env staging --yes
```

---

## 5. Copying Data Directly Between Buckets (`s3:copy`)

You can copy media files directly from one bucket to another without downloading anything to your local disk.

### How It Works

1. **Server-Side Copy**: When source and destination buckets share the same S3 account/endpoint, the script uses the S3 `CopyObjectCommand` directly in the cloud.
2. **In-Memory Stream Fallback**: When copying across different S3 endpoints, regions, or accounts, the script streams objects in memory between buckets without saving files to disk.
3. **Smart Skip**: Already-existing files in the target bucket with matching sizes are skipped.

### Quick Start

```bash
# Copy from production to staging environment
pnpm s3:copy --from production --to staging

# Copy between explicit bucket names (using active .env credentials)
pnpm s3:copy --from-bucket daminhgovap --to-bucket my-backup-bucket

# Dry run preview (simulate copy without writing to target bucket)
pnpm s3:copy --from production --to staging --dry-run

# Filter by prefix and skip confirmation
pnpm s3:copy --from production --to staging --prefix media/ --yes
```

---

## 6. Command Line Options Reference

### `s3:backup` Options

| Option                | Shorthand | Description                                           | Default                               |
| :-------------------- | :-------- | :---------------------------------------------------- | :------------------------------------ |
| `--env <name>`        | `-e`      | Target environment (`production`, `staging`, `local`) | `.env`                                |
| `--env-file <path>`   |           | Path to explicit `.env` file                          |                                       |
| `--bucket <name>`     | `-b`      | Override bucket name                                  | From env                              |
| `--prefix <prefix>`   | `-p`      | Filter by object key prefix                           | (all)                                 |
| `--out <dir>`         | `-o`      | Destination directory                                 | `tmp/backups/s3_<bucket>_<timestamp>` |
| `--concurrency <n>`   | `-c`      | Number of concurrent downloads                        | `10`                                  |
| `--archive` / `--tar` | `-z`      | Create a `.tar.gz` archive                            | `false`                               |
| `--clean-dir`         |           | Delete directory after creating archive               | `false`                               |
| `--force`             | `-f`      | Re-download files even if size matches                | `false`                               |
| `--tool <engine>`     |           | Engine to execute: `node`, `rclone`, or `aws`         | `node`                                |
| `--help`              | `-h`      | Show help message                                     |                                       |

---

### `s3:restore` Options

| Option              | Shorthand | Description                                           | Default                 |
| :------------------ | :-------- | :---------------------------------------------------- | :---------------------- |
| `[source]`          |           | Path to backup directory or archive                   | Latest in `tmp/backups` |
| `--env <name>`      | `-e`      | Target environment (`production`, `staging`, `local`) | `.env`                  |
| `--env-file <path>` |           | Path to explicit `.env` file                          |                         |
| `--bucket <name>`   | `-b`      | Override destination bucket name                      | From env                |
| `--prefix <prefix>` | `-p`      | Prepend key prefix to uploaded objects                | (none)                  |
| `--src <path>`      | `-s`      | Explicit source directory or archive                  |                         |
| `--concurrency <n>` | `-c`      | Number of concurrent uploads                          | `10`                    |
| `--dry-run`         |           | Simulate restore without writing to bucket            | `false`                 |
| `--force`           | `-f`      | Re-upload files even if size matches in bucket        | `false`                 |
| `--yes`             | `-y`      | Skip confirmation prompt                              | `false`                 |
| `--tool <engine>`   |           | Engine to execute: `node`, `rclone`, or `aws`         | `node`                  |
| `--help`            | `-h`      | Show help message                                     |                         |

---

### `s3:copy` Options

| Option                   | Shorthand | Description                                           | Default   |
| :----------------------- | :-------- | :---------------------------------------------------- | :-------- |
| `--from <name>`          |           | Source environment (`production`, `staging`, `local`) | `.env`    |
| `--to <name>`            |           | Target environment (`production`, `staging`, `local`) | From from |
| `--from-env-file <path>` |           | Path to source `.env` file                            |           |
| `--to-env-file <path>`   |           | Path to target `.env` file                            |           |
| `--from-bucket <name>`   |           | Source bucket name override                           | From env  |
| `--to-bucket <name>`     |           | Target bucket name override                           | From env  |
| `--prefix <prefix>`      | `-p`      | Filter source objects by key prefix                   | (all)     |
| `--target-prefix <pre>`  |           | Prepend prefix to copied keys in target bucket        | (none)    |
| `--concurrency <n>`      | `-c`      | Number of concurrent copy operations                  | `10`      |
| `--dry-run`              |           | Simulate copy without writing to destination          | `false`   |
| `--force`                | `-f`      | Re-copy files even if size matches in target          | `false`   |
| `--yes`                  | `-y`      | Skip confirmation prompt                              | `false`   |
| `--help`                 | `-h`      | Show help message                                     |           |

---

## 7. Using External CLI Engines (`rclone` / `aws`)

If you prefer using `rclone` or the AWS CLI in specialized environments (e.g. Docker containers or CI pipelines):

```bash
# Backup using rclone
bash scripts/s3-backup.sh --tool=rclone

# Restore using AWS CLI
bash scripts/s3-restore.sh ./media-backup --tool=aws
```

Requirements:

- For `rclone`: `rclone` installed (`brew install rclone` or package manager)
- For `aws`: AWS CLI installed (`brew install awscli`)

---

## 7. Troubleshooting

1. **`Required S3 credentials missing`**:
   - Ensure `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET`, and `S3_ENDPOINT` are populated in your `.env` or `.env.<environment>` file.
2. **Slow transfers for thousands of files**:
   - Increase `--concurrency` (e.g. `--concurrency 20`).
3. **MIME type / Content-Type on uploaded files**:
   - `scripts/s3-restore.mjs` automatically assigns proper MIME types (`image/webp`, `image/jpeg`, `image/png`, `application/pdf`, etc.) so files render directly in browsers.
