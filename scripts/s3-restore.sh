#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/tmp/backups"

# Print usage if requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  echo "📦 S3 / Cloudflare R2 Restore Script"
  echo ""
  echo "Usage:"
  echo "  bash scripts/s3-restore.sh [source] [options]"
  echo "  pnpm s3:restore [source] [options]"
  echo ""
  echo "Arguments:"
  echo "  [source]                 Path to backup directory or .tar.gz archive"
  echo "                           (default: most recent backup in tmp/backups)"
  echo ""
  echo "Options:"
  echo "  -e, --env <name>         Target environment (production, staging, local, default)"
  echo "  --env-file <path>        Custom .env file path"
  echo "  -b, --bucket <name>      Override destination S3 bucket name"
  echo "  -p, --prefix <prefix>    Prefix to prepend to uploaded keys"
  echo "  -s, --src <path>         Explicit source directory or archive"
  echo "  -c, --concurrency <num>  Number of concurrent uploads (default: 10)"
  echo "  --tool <node|rclone|aws> Specific tool to execute (default: node)"
  echo "  --dry-run                Simulate upload without writing to bucket"
  echo "  -f, --force              Re-upload files even if size matches in bucket"
  echo "  -y, --yes                Skip confirmation prompt"
  echo "  -h, --help               Show this help message"
  echo ""
  echo "Examples:"
  echo "  pnpm s3:restore"
  echo "  pnpm s3:restore production"
  echo "  pnpm s3:restore tmp/backups/s3_daminhgovap_20260908.tar.gz --env staging"
  echo "  pnpm s3:restore ./media --dry-run"
  exit 0
fi

# Check if a specific tool was explicitly requested
TOOL="node"
FORWARD_ARGS=()

for arg in "$@"; do
  case $arg in
    --tool=*)
      TOOL="${arg#*=}"
      ;;
    *)
      FORWARD_ARGS+=("$arg")
      ;;
  esac
done

# If rclone or aws CLI was explicitly chosen
if [ "$TOOL" = "rclone" ]; then
  if ! command -v rclone &> /dev/null; then
    echo "❌ Error: 'rclone' is not installed. Run 'brew install rclone' or use default Node runner."
    exit 1
  fi

  # Determine source
  SRC="${1}"
  if [ -z "$SRC" ] || [[ "$SRC" =~ ^(production|staging|local|default)$ ]]; then
    ENV_NAME="${SRC:-production}"
    # Find latest in tmp/backups
    LATEST=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "s3_*" 2>/dev/null | xargs ls -td 2>/dev/null | head -n 1)
    if [ -z "$LATEST" ]; then
      echo "❌ Error: No backup directory found in $BACKUP_DIR."
      exit 1
    fi
    SRC="$LATEST"
    echo "ℹ️ Using latest backup: $SRC"
  else
    ENV_NAME="production"
  fi

  ENV_FILE="$PROJECT_ROOT/.env.$ENV_NAME"
  [ ! -f "$ENV_FILE" ] && ENV_FILE="$PROJECT_ROOT/.env"

  if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    echo "✅ Loaded environment variables from $ENV_FILE"
  fi

  BUCKET="${S3_BUCKET:-$R2_BUCKET}"
  ACCESS_KEY="${S3_ACCESS_KEY_ID:-$R2_ACCESS_KEY_ID}"
  SECRET_KEY="${S3_SECRET:-$R2_SECRET_ACCESS_KEY}"
  ENDPOINT="${S3_ENDPOINT:-$R2_ENDPOINT}"

  if [ -z "$BUCKET" ] || [ -z "$ACCESS_KEY" ] || [ -z "$SECRET_KEY" ]; then
    echo "❌ Error: Required S3/R2 credentials not found in environment."
    exit 1
  fi

  export RCLONE_CONFIG_REMOTE_S3_TYPE=s3
  export RCLONE_CONFIG_REMOTE_S3_PROVIDER=Cloudflare
  export RCLONE_CONFIG_REMOTE_S3_ENDPOINT="$ENDPOINT"
  export RCLONE_CONFIG_REMOTE_S3_ACCESS_KEY_ID="$ACCESS_KEY"
  export RCLONE_CONFIG_REMOTE_S3_SECRET_ACCESS_KEY="$SECRET_KEY"

  echo "⏳ Restoring files from '$SRC' to S3 bucket '$BUCKET' via rclone..."
  rclone copy "$SRC" "REMOTE_S3:$BUCKET" --progress --transfers 8 --checkers 16
  echo "✅ S3 restore completed to bucket '$BUCKET'"
  exit 0
elif [ "$TOOL" = "aws" ]; then
  if ! command -v aws &> /dev/null; then
    echo "❌ Error: 'aws' CLI is not installed. Run 'brew install awscli' or use default Node runner."
    exit 1
  fi

  SRC="${1}"
  if [ -z "$SRC" ] || [[ "$SRC" =~ ^(production|staging|local|default)$ ]]; then
    ENV_NAME="${SRC:-production}"
    LATEST=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "s3_*" 2>/dev/null | xargs ls -td 2>/dev/null | head -n 1)
    if [ -z "$LATEST" ]; then
      echo "❌ Error: No backup directory found in $BACKUP_DIR."
      exit 1
    fi
    SRC="$LATEST"
    echo "ℹ️ Using latest backup: $SRC"
  else
    ENV_NAME="production"
  fi

  ENV_FILE="$PROJECT_ROOT/.env.$ENV_NAME"
  [ ! -f "$ENV_FILE" ] && ENV_FILE="$PROJECT_ROOT/.env"

  if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
    echo "✅ Loaded environment variables from $ENV_FILE"
  fi

  BUCKET="${S3_BUCKET:-$R2_BUCKET}"
  export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID:-$R2_ACCESS_KEY_ID}"
  export AWS_SECRET_ACCESS_KEY="${S3_SECRET:-$R2_SECRET_ACCESS_KEY}"
  ENDPOINT="${S3_ENDPOINT:-$R2_ENDPOINT}"

  EXTRA_FLAGS=()
  [ -n "$ENDPOINT" ] && EXTRA_FLAGS+=(--endpoint-url "$ENDPOINT")

  echo "⏳ Restoring files from '$SRC' to S3 bucket '$BUCKET' via AWS CLI..."
  aws s3 sync "$SRC" "s3://$BUCKET" "${EXTRA_FLAGS[@]}"
  echo "✅ S3 restore completed to bucket '$BUCKET'"
  exit 0
fi

# Default / Node.js runner
exec node "$SCRIPT_DIR/s3-restore.mjs" "${FORWARD_ARGS[@]}"
