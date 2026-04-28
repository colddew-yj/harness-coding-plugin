#!/bin/bash
# Backup opencode.json before any changes
CONFIG="$HOME/.opencode/opencode.json"
BACKUP_DIR="$HOME/.opencode/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"
if [ -f "$CONFIG" ]; then
  cp "$CONFIG" "$BACKUP_DIR/opencode.json.$TIMESTAMP.bak"
  echo "✅ Backup saved: $BACKUP_DIR/opencode.json.$TIMESTAMP.bak"
  ls -la "$BACKUP_DIR"/*.bak 2>/dev/null | tail -5
fi
