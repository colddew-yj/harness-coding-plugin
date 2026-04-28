#!/bin/bash
# Restore opencode.json from latest backup
CONFIG="$HOME/.opencode/opencode.json"
BACKUP_DIR="$HOME/.opencode/backups"

LATEST=$(ls -t "$BACKUP_DIR"/opencode.json.*.bak 2>/dev/null | head -1)
if [ -z "$LATEST" ]; then
  echo "❌ No backup found"
  exit 1
fi

cp "$LATEST" "$CONFIG"
echo "✅ Restored from: $LATEST"
echo "Config content:"
cat "$CONFIG"
