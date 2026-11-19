#!/bin/bash

set -euo pipefail

SOURCE_URI="${1:-}"
TARGET_URI="${2:-}"

if [ -z "$SOURCE_URI" ] || [ -z "$TARGET_URI" ]; then
  echo "Usage: $0 <source_uri> <target_uri>"
  exit 1
fi

if ! command -v mongosh &> /dev/null; then
  echo "Error: 'mongosh' command not found."
  exit 1
fi

get_counts() {
  local uri="$1"
  mongosh "$uri" --quiet --eval '
    const names = db.getCollectionNames().filter((n) => !n.startsWith("system.")).sort();
    const out = {};
    for (const name of names) {
      out[name] = db.getCollection(name).countDocuments({});
    }
    print(JSON.stringify(out));
  '
}

SOURCE_JSON="$(get_counts "$SOURCE_URI")"
TARGET_JSON="$(get_counts "$TARGET_URI")"

SOURCE_JSON="$SOURCE_JSON" TARGET_JSON="$TARGET_JSON" node -e '
  const src = JSON.parse(process.env.SOURCE_JSON);
  const dst = JSON.parse(process.env.TARGET_JSON);
  const allNames = Array.from(new Set([...Object.keys(src), ...Object.keys(dst)])).sort();

  let mismatch = false;
  console.log("Collection".padEnd(32), "Source".padStart(10), "Target".padStart(10), "Status");
  console.log("-".repeat(64));

  for (const name of allNames) {
    const s = src[name] ?? "MISSING";
    const t = dst[name] ?? "MISSING";
    const ok = s === t && s !== "MISSING";
    if (!ok) mismatch = true;
    console.log(name.padEnd(32), String(s).padStart(10), String(t).padStart(10), ok ? "OK" : "MISMATCH");
  }

  if (mismatch) {
    process.exit(1);
  }
'
