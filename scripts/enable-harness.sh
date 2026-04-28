#!/bin/bash
# Enable harness plugin with automatic backup
CONFIG="$HOME/.opencode/opencode.json"
BACKUP_DIR="$HOME/.opencode/backups"
PLUGIN_PATH="/Users/yidongwu/projects/harness-coding-plugin"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Auto backup before change
mkdir -p "$BACKUP_DIR"
if [ -f "$CONFIG" ]; then
  cp "$CONFIG" "$BACKUP_DIR/opencode.json.before-enable.$TIMESTAMP.bak"
  echo "📦 Auto backup: opencode.json.before-enable.$TIMESTAMP.bak"
fi

node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('$CONFIG', 'utf8'));
const exists = config.plugin.some(p => {
  if (typeof p === 'string') return p.includes('harness-coding-plugin');
  if (typeof p === 'object') return p.source?.includes('harness-coding-plugin');
  return false;
});
if (!exists) {
  config.plugin.push('$PLUGIN_PATH');
  fs.writeFileSync('$CONFIG', JSON.stringify(config, null, 2) + '\n');
  console.log('✅ Harness plugin enabled');
} else {
  console.log('⚠️  Harness plugin already enabled');
}
console.log('Current plugins:', JSON.stringify(config.plugin, null, 2));
"
