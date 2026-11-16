#!/bin/bash

set -euo pipefail

: "${DATABASE_URI:?DATABASE_URI is required}"
: "${R2_ENDPOINT:?R2_ENDPOINT is required}"
: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is required}"
: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is required}"

R2_BUCKET="${R2_BUCKET:-daminhgovap-db-backups}"
BACKUP_PREFIX="${BACKUP_PREFIX:-production}"
TIMESTAMP="$(date -u +%Y%m%d_%H%M%SZ)"
TMP_FILE="/tmp/dump_${TIMESTAMP}.gz"
REMOTE_PATH="r2:${R2_BUCKET}/${BACKUP_PREFIX}/dump_${TIMESTAMP}.gz"

trap 'rm -f "$TMP_FILE"' EXIT

export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ENDPOINT="$R2_ENDPOINT"
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

echo "Starting mongodump..."
mongodump --uri="$DATABASE_URI" --archive="$TMP_FILE" --gzip --quiet

FILE_SIZE="$(du -h "$TMP_FILE" | cut -f1)"
echo "Dump complete (${FILE_SIZE}). Uploading to ${REMOTE_PATH}..."

rclone copyto "$TMP_FILE" "$REMOTE_PATH" --no-check-dest
rclone lsjson "$REMOTE_PATH" > /dev/null

echo "Backup verified at ${REMOTE_PATH}."
