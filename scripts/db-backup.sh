#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/tmp/backups"

# Allow CLI argument override
DB_BACKUP_URL="${1:-$DB_BACKUP_URL}"

# Load environment files if DB_BACKUP_URL is not set
if [ -z "$DB_BACKUP_URL" ]; then
  for env_file in "$PROJECT_ROOT/.env.local" "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.production"; do
    if [ -f "$env_file" ]; then
      set -a
      # shellcheck source=/dev/null
      source "$env_file"
      set +a
      [ -n "$DB_BACKUP_URL" ] && break
    fi
  done
fi

if [ -z "$DB_BACKUP_URL" ]; then
  echo "❌ Error: DB_BACKUP_URL is not set."
  echo "Please set DB_BACKUP_URL in your environment or .env file, or pass it as an argument."
  echo "Example: DB_BACKUP_URL=\"mongodb://localhost:27017/da-minh-go-vap\" pnpm db:backup"
  exit 1
fi

if ! command -v mongodump &> /dev/null; then
  echo "❌ Error: 'mongodump' command not found. Please install mongodb-database-tools."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dump_${TIMESTAMP}.gz"

echo "⏳ Backing up database to $BACKUP_FILE ..."

if mongodump --uri="$DB_BACKUP_URL" --archive="$BACKUP_FILE" --gzip; then
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1 | tr -d ' ')
  echo "✅ Database backup successful!"
  echo "📦 Dump file: $BACKUP_FILE ($FILE_SIZE)"
else
  echo "❌ Database backup failed."
  rm -f "$BACKUP_FILE"
  exit 1
fi
