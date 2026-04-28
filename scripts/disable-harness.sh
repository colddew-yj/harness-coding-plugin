#!/bin/bash
# Disable harness plugin with automatic backup
CONFIG="$HOME/.opencode/opencode.json"
BACKUP_DIR="$HOME/.opencode/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Auto backup before change
mkdir -p "$BACKUP_DIR"
if [ -f "$CONFIG" ]; then
  cp "$CONFIG" "$BACKUP_DIR/opencode.json.before-disable.$TIMESTAMP.bak"
  echo "📦 Auto backup: opencode.json.before-disable.$TIMESTAMP.bak"
fi

node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('$CONFIG', 'utf8'));
config.plugin = config.plugin.filter(p => {
  if (typeof p === 'string') return !p.includes('harness-coding-plugin');
  if (typeof p === 'object') return !p.source?.includes('harness-coding-plugin');
  return true;
});
fs.writeFileSync('$CONFIG', JSON.stringify(config, null, 2) + '\n');
console.log('✅ Harness plugin disabled');
console.log('Current plugins:', JSON.stringify(config.plugin));
"
