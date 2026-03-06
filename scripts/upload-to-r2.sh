#!/bin/zsh

# Upload media files to Cloudflare R2 storage
# Prerequisites: brew install rclone
# Usage: ./upload-to-r2.sh [source_dir] [destination_bucket]
# Environment variables required: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY

# Default values (override via arguments or env vars)
SRC="${1}"
DEST="${2:-r2:daminhgovap}"

# Configure rclone for R2 via environment variables
if [[ -z "$R2_ENDPOINT" || -z "$R2_ACCESS_KEY_ID" || -z "$R2_SECRET_ACCESS_KEY" ]]; then
  echo "Error: Required environment variables not set (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)"
  exit 1
fi

export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ENDPOINT="$R2_ENDPOINT"
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"

echo "Uploading files from $SRC to $DEST ..."
rclone copy "$SRC" "$DEST" --progress --transfers 8 --checkers 16

if [[ $? -eq 0 ]]; then
  echo "Upload completed successfully!"
else
  echo "Error: Upload failed."
  exit 1
fi
