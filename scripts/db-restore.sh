#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/tmp/backups"

# Parse arguments intelligently
ARG1="$1"
ARG2="$2"

DUMP_FILE=""

if [[ "$ARG1" =~ ^mongodb(\+srv)?:// ]]; then
  DB_RESTORE_URL="$ARG1"
  if [ -n "$ARG2" ]; then
    DUMP_FILE="$ARG2"
  fi
elif [ -n "$ARG1" ]; then
  DUMP_FILE="$ARG1"
fi

# Load environment files if DB_RESTORE_URL is not set
if [ -z "$DB_RESTORE_URL" ]; then
  for env_file in "$PROJECT_ROOT/.env.local" "$PROJECT_ROOT/.env" "$PROJECT_ROOT/.env.production"; do
    if [ -f "$env_file" ]; then
      set -a
      # shellcheck source=/dev/null
      source "$env_file"
      set +a
      [ -n "$DB_RESTORE_URL" ] && break
    fi
  done
fi

if [ -z "$DB_RESTORE_URL" ]; then
  echo "❌ Error: DB_RESTORE_URL is not set."
  echo "Please set DB_RESTORE_URL in your environment or .env file, or pass it as an argument."
  echo "Examples:"
  echo "  pnpm db:restore \"mongodb://localhost:27017/da-minh-go-vap\""
  echo "  DB_RESTORE_URL=\"mongodb://localhost:27017/da-minh-go-vap\" pnpm db:restore"
  exit 1
fi

if ! command -v mongorestore &> /dev/null; then
  echo "❌ Error: 'mongorestore' command not found. Please install mongodb-database-tools."
  exit 1
fi

# Determine dump file if not explicitly specified
if [ -z "$DUMP_FILE" ]; then
  if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory $BACKUP_DIR does not exist."
    exit 1
  fi

  # Find the most recent file in ./tmp/backups
  LATEST_DUMP=$(find "$BACKUP_DIR" -maxdepth 1 -type f \( -name "*.gz" -o -name "*.archive" -o -name "*.dump" -o -name "*.tar.gz" \) -exec ls -t {} + 2>/dev/null | head -n 1)
  if [ -z "$LATEST_DUMP" ]; then
    LATEST_DUMP=$(find "$BACKUP_DIR" -maxdepth 1 -type f 2>/dev/null | xargs ls -t 2>/dev/null | head -n 1)
  fi

  if [ -z "$LATEST_DUMP" ]; then
    echo "❌ Error: No backup files found in $BACKUP_DIR"
    exit 1
  fi

  DUMP_FILE="$LATEST_DUMP"
  echo "ℹ️ Using latest backup: $DUMP_FILE"
fi

if [ ! -f "$DUMP_FILE" ] && [ ! -d "$DUMP_FILE" ]; then
  echo "❌ Error: Dump file not found at: $DUMP_FILE"
  exit 1
fi

# Extract target database name from DB_RESTORE_URL if provided
PROTO_STRIPPED="${DB_RESTORE_URL#*://}"
TARGET_DB=""
if [[ "$PROTO_STRIPPED" == *"/"* ]]; then
  PATH_AND_QUERY="${PROTO_STRIPPED#*/}"
  TARGET_DB="${PATH_AND_QUERY%%\?*}"
fi

# Detect if gzipped
GZIP_FLAG=""
if gzip -t "$DUMP_FILE" 2>/dev/null || [[ "$DUMP_FILE" == *.gz ]]; then
  GZIP_FLAG="--gzip"
fi

RESTORE_ARGS=(--uri="$DB_RESTORE_URL" --drop)
[ -n "$GZIP_FLAG" ] && RESTORE_ARGS+=("$GZIP_FLAG")

if [ -d "$DUMP_FILE" ]; then
  RESTORE_ARGS+=(--dir="$DUMP_FILE")
else
  RESTORE_ARGS+=(--archive="$DUMP_FILE")
fi

# If target database is specified in URI, remap namespaces so dumps from other database names restore properly
if [ -n "$TARGET_DB" ]; then
  echo "⏳ Restoring database from $DUMP_FILE to '$TARGET_DB' ..."
  RESTORE_ARGS+=(--nsInclude="*" "--nsFrom=\$from\$.\$collection\$" "--nsTo=${TARGET_DB}.\$collection\$")
else
  echo "⏳ Restoring database from $DUMP_FILE to destination database ..."
  RESTORE_ARGS+=(--nsInclude="*")
fi

mongorestore "${RESTORE_ARGS[@]}"

if [ $? -eq 0 ]; then
  echo "✅ Database restore completed successfully from $DUMP_FILE"
else
  echo "❌ Database restore failed."
  exit 1
fi
