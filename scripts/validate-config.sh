#!/bin/bash
# Validate opencode.json is valid JSON and has correct structure
CONFIG="$HOME/.opencode/opencode.json"

echo "=== Validating opencode.json ==="

# Check file exists
if [ ! -f "$CONFIG" ]; then
  echo "❌ Config file not found: $CONFIG"
  exit 1
fi

# Validate JSON
node -e "
const fs = require('fs');
try {
  const config = JSON.parse(fs.readFileSync('$CONFIG', 'utf8'));
  console.log('✅ Valid JSON');
  console.log('Plugins:', JSON.stringify(config.plugin, null, 2));
  if (!Array.isArray(config.plugin)) {
    console.log('❌ plugin must be an array');
    process.exit(1);
  }
  config.plugin.forEach((p, i) => {
    if (typeof p === 'string') {
      console.log('  [' + i + '] string: ' + p);
    } else if (typeof p === 'object' && p !== null) {
      console.log('  [' + i + '] object: ' + JSON.stringify(p));
    } else {
      console.log('  [' + i + '] ❌ Invalid type: ' + typeof p);
      process.exit(1);
    }
  });
  console.log('✅ Config validation passed');
} catch (e) {
  console.log('❌ Invalid config: ' + e.message);
  process.exit(1);
}
"
