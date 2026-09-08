#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print usage if requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
  echo "📦 S3 / Cloudflare R2 Bucket-to-Bucket Copy Script"
  echo ""
  echo "Usage:"
  echo "  bash scripts/s3-copy.sh [options]"
  echo "  pnpm s3:copy [options]"
  echo ""
  echo "Options:"
  echo "  --from <env>             Source environment (e.g. production, default)"
  echo "  --to <env>               Target environment (e.g. staging)"
  echo "  --from-env-file <path>   Source .env file path"
  echo "  --to-env-file <path>     Target .env file path"
  echo "  --from-bucket <name>     Source S3 bucket name"
  echo "  --to-bucket <name>       Target S3 bucket name"
  echo "  -p, --prefix <prefix>    Source prefix filter"
  echo "  --target-prefix <prefix> Target key prefix to prepend"
  echo "  -c, --concurrency <num>  Concurrent operations (default: 10)"
  echo "  --tool <node|rclone>     Engine to use (default: node)"
  echo "  --dry-run                Simulate copy without writing to destination"
  echo "  -f, --force              Re-copy files even if size matches in target"
  echo "  -y, --yes                Skip confirmation prompt"
  echo "  -h, --help               Show this help message"
  echo ""
  echo "Examples:"
  echo "  pnpm s3:copy --from production --to staging"
  echo "  pnpm s3:copy --from-bucket daminhgovap --to-bucket daminhgovap-backup"
  echo "  pnpm s3:copy --from production --to staging --prefix media/ --dry-run"
  exit 0
fi

# Check if rclone was requested
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

if [ "$TOOL" = "rclone" ]; then
  if ! command -v rclone &> /dev/null; then
    echo "❌ Error: 'rclone' is not installed. Run 'brew install rclone' or use default Node runner."
    exit 1
  fi
  # Execute rclone if configured
  echo "Please configure source and destination remotes in rclone or use default Node runner."
  exit 1
fi

exec node "$SCRIPT_DIR/s3-copy.mjs" "${FORWARD_ARGS[@]}"
