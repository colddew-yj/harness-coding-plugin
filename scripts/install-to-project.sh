#!/bin/bash
# Install harness plugin to current project
# Usage: bash install-to-project.sh [project-directory]

PROJECT_DIR="${1:-.}"
CONFIG_FILE="$PROJECT_DIR/opencode.json"
HARNESS_PATH="/Users/yidongwu/projects/harness-coding-plugin"

echo "=== Harness Plugin Installer ==="
echo "Target: $CONFIG_FILE"

# Create opencode.json if not exists
if [ ! -f "$CONFIG_FILE" ]; then
  echo '{"plugin": [], "provider": {}}' > "$CONFIG_FILE"
  echo "✅ Created $CONFIG_FILE"
fi

# Check if already installed
if grep -q "harness-coding-plugin" "$CONFIG_FILE" 2>/dev/null; then
  echo "⚠️  Harness plugin already installed"
  cat "$CONFIG_FILE"
  exit 0
fi

# Backup
cp "$CONFIG_FILE" "${CONFIG_FILE}.bak"
echo "📦 Backup: ${CONFIG_FILE}.bak"

# Add plugin
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
config.plugin = config.plugin || [];
config.plugin.push('$HARNESS_PATH');
fs.writeFileSync('$CONFIG_FILE', JSON.stringify(config, null, 2) + '\n');
console.log('✅ Harness plugin added');
console.log('Config:');
console.log(fs.readFileSync('$CONFIG_FILE', 'utf8'));
"

echo ""
echo "Next steps:"
echo "1. Restart opencode in this project"
echo "2. Verify with /skills and @mention"
