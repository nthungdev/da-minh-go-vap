#!/bin/bash

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
TEMP_DIR="$SCRIPT_DIR/../tmp"
mkdir -p "$TEMP_DIR"
BACKUPS_DIR="$SCRIPT_DIR/../out/backups"
mkdir -p "$BACKUPS_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

function prepare_backup_folders() {
  # Media files
  MEDIA_PATH="$SCRIPT_DIR/../media"
  read -p "Enter media path [default: $MEDIA_PATH]: " input
  MEDIA_PATH=${input:-$MEDIA_PATH}

  if [ ! -d "$MEDIA_PATH" ]; then
    echo "⚠️ Media path $MEDIA_PATH does not exist, skipping media backup"
  else
    MEDIA_TEMP_PATH="$TEMP_DIR/media"
    mkdir -p "$MEDIA_TEMP_PATH"
    echo "⏳ Copying media files to backup folder"
    cp -a "$MEDIA_PATH/." "$MEDIA_TEMP_PATH/"
    if [ $? -ne 0 ]; then
      echo "❌ Media copy failed"
      exit 1
    else
      echo "✅ Media files copied successfully"
    fi
  fi

  # Mongo dump
  MONGO_DUMP_PATH="$TEMP_DIR/mongo"
  echo "⏳ Backing up MongoDB database"
  mongodump --uri="$DATABASE_URI" --out "$MONGO_DUMP_PATH"
  if [ $? -ne 0 ]; then
    echo "❌ mongodump failed"
    exit 1
  else
    echo "✅ mongodump completed successfully"
  fi
}

function create_combined_archive() {
  COMBINED_ARCHIVE_PATH="$BACKUPS_DIR/$TIMESTAMP-backup.tar.gz"
  echo "⏳ Creating combined archive $COMBINED_ARCHIVE_PATH"
  tar -czf "$COMBINED_ARCHIVE_PATH" -C "$TEMP_DIR" mongo media
  if [ $? -ne 0 ]; then
    echo "❌ Archive compression failed"
    exit 1
  else
    echo "✅ Archive created successfully"
    echo "Backup archive is created at: $COMBINED_ARCHIVE_PATH"
  fi
}

load_environment $1
prepare_backup_folders
create_combined_archive

rm -rf "$TEMP_DIR"
echo "✅ Cleaned up temporary files"
