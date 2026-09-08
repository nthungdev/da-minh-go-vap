#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/tmp/backups"
mkdir -p "$BACKUP_DIR"

# Print usage if requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  echo "📦 S3 / Cloudflare R2 Backup Script"
  echo ""
  echo "Usage:"
  echo "  bash scripts/s3-backup.sh [environment] [options]"
  echo "  pnpm s3:backup [environment] [options]"
  echo ""
  echo "Options:"
  echo "  [environment]            Environment (production, staging, local, default)"
  echo "  -e, --env <name>         Environment name"
  echo "  --env-file <path>        Custom .env file path"
  echo "  -b, --bucket <name>      Override S3 bucket name"
  echo "  -p, --prefix <prefix>    Only backup objects matching key prefix"
  echo "  -o, --out <dir>          Target backup directory"
  echo "  -c, --concurrency <num>  Number of concurrent downloads (default: 10)"
  echo "  -z, --archive            Compress to .tar.gz archive"
  echo "  --tool <node|rclone|aws> Specific tool to execute (default: node)"
  echo "  --clean-dir              Remove raw folder after creating archive"
  echo "  -f, --force              Re-download files even if size matches locally"
  echo "  -h, --help               Show this help message"
  echo ""
  echo "Examples:"
  echo "  pnpm s3:backup"
  echo "  pnpm s3:backup production"
  echo "  pnpm s3:backup production --archive"
  echo "  bash scripts/s3-backup.sh --out ./tmp/my-backup --archive"
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
    --tool)
      # Handled on next index if loop supported, or pass through
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

  # Load environment
  ENV_NAME="${1:-production}"
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

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  DEST_DIR="$BACKUP_DIR/s3_${BUCKET}_${TIMESTAMP}"
  mkdir -p "$DEST_DIR"

  export RCLONE_CONFIG_REMOTE_S3_TYPE=s3
  export RCLONE_CONFIG_REMOTE_S3_PROVIDER=Cloudflare
  export RCLONE_CONFIG_REMOTE_S3_ENDPOINT="$ENDPOINT"
  export RCLONE_CONFIG_REMOTE_S3_ACCESS_KEY_ID="$ACCESS_KEY"
  export RCLONE_CONFIG_REMOTE_S3_SECRET_ACCESS_KEY="$SECRET_KEY"

  echo "⏳ Syncing from S3 bucket '$BUCKET' to '$DEST_DIR' via rclone..."
  rclone copy "REMOTE_S3:$BUCKET" "$DEST_DIR" --progress --transfers 8 --checkers 16
  echo "✅ S3 backup completed: $DEST_DIR"
  exit 0
elif [ "$TOOL" = "aws" ]; then
  if ! command -v aws &> /dev/null; then
    echo "❌ Error: 'aws' CLI is not installed. Run 'brew install awscli' or use default Node runner."
    exit 1
  fi

  ENV_NAME="${1:-production}"
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

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  DEST_DIR="$BACKUP_DIR/s3_${BUCKET}_${TIMESTAMP}"
  mkdir -p "$DEST_DIR"

  EXTRA_FLAGS=()
  [ -n "$ENDPOINT" ] && EXTRA_FLAGS+=(--endpoint-url "$ENDPOINT")

  echo "⏳ Syncing from S3 bucket '$BUCKET' to '$DEST_DIR' via AWS CLI..."
  aws s3 sync "s3://$BUCKET" "$DEST_DIR" "${EXTRA_FLAGS[@]}"
  echo "✅ S3 backup completed: $DEST_DIR"
  exit 0
fi

# Default / Node.js runner
exec node "$SCRIPT_DIR/s3-backup.mjs" "${FORWARD_ARGS[@]}"
