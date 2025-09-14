#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TEMP_DIR="$SCRIPT_DIR/../tmp"
mkdir -p "$TEMP_DIR"
BACKUPS_DIR="$SCRIPT_DIR/../out/backups"

function load_environment() {
  ENVIRONMENT=${1:-default}
  ENV_FILE=".env"

  case "$ENVIRONMENT" in
    production)
      ENV_FILE=".env.production"
      ;;
    local)
      ENV_FILE=".env.local"
      ;;
    default)
      ENV_FILE=".env"
      ;;
    *)
      echo "Unknown environment: $ENVIRONMENT"
      echo "Usage: $0 [production|local|default]"
      exit 1
      ;;
  esac


  # Load env file if it exists
  ENV_FILE="$SCRIPT_DIR/../$ENV_FILE"
  if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    echo "✅ Loaded environment variables from $ENV_FILE"
  else
    echo "⚠️ Warning: $ENV_FILE not found, using existing env vars"
  fi
}

function get_timestamp() {
  if [ -n "$1" ]; then
    TIMESTAMP="$1"
    echo "Using timestamp from argument: $TIMESTAMP"
    return
  fi

  echo "Make sure the backup files are in directory: $BACKUPS_DIR"
  echo "Backup files should be named: <timestamp>-backup.tar.gz"

  while true; do
    read -p "Enter timestamp of the backups (Format: YYYYMMDD_HHMMSS, e.g. 20250906_123456): " input
    if [ -n "$input" ]; then
      TIMESTAMP="$input"
      break
    else
      echo "Timestamp cannot be empty. Please try again."
    fi
  done
}

function restore() {
  # Unarchive the backup
  ARCHIVE_PATH="$BACKUPS_DIR/$TIMESTAMP-backup.tar.gz"
  EXTRACT_PATH="$TEMP_DIR/$TIMESTAMP-backup"
  echo "⏳ Unarchiving backup to $EXTRACT_PATH"
  mkdir -p "$EXTRACT_PATH"
  tar -xzvf "$ARCHIVE_PATH" -C "$EXTRACT_PATH"
  if [ $? -ne 0 ]; then
    echo "❌ Combined archive extraction failed"
    exit 1
  else
    echo "✅ Combined archive extracted successfully"
  fi

  # Restore Media
  MEDIA_EXTRACT_PATH="$EXTRACT_PATH/media"
  MEDIA_PATH="$SCRIPT_DIR/../media"
  read -p "Enter media path [default: $MEDIA_PATH]: " input
  MEDIA_PATH=${input:-$MEDIA_PATH}
  mkdir -p "$MEDIA_PATH"
  echo "⏳ Copying media files to $MEDIA_PATH"
  cp -a "$MEDIA_EXTRACT_PATH/." "$MEDIA_PATH/"
  if [ $? -ne 0 ]; then
    echo "❌ Media restoration failed"
    exit 1
  else
    echo "✅ Media restoration completed successfully"
  fi

  # Restore Mongo
  MONGO_EXTRACT_PATH="$EXTRACT_PATH/mongo"
  echo "⏳ Restoring MongoDB database from $MONGO_EXTRACT_PATH"
  mongorestore --uri="$DATABASE_URI" --dir "$MONGO_EXTRACT_PATH/$DATABASE_NAME" --drop
  if [ $? -ne 0 ]; then
    echo "❌ mongorestore failed"
    exit 1
  else
    echo "✅ mongorestore completed successfully"
  fi
}

load_environment $1
get_timestamp $2
restore

rm -rf "$TEMP_DIR"
echo "✅ Cleaned up temporary files"
