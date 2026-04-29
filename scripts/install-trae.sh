#!/bin/bash
set -e

# Harness Coding Plugin — Trae Adapter Installer
# Supports both Trae International and Trae CN

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ADAPTER_DIR="$(cd "$SCRIPT_DIR/../adapters/trae" && pwd)"
PLUGIN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔧 Harness Coding Plugin — Trae Adapter Installer"
echo "=================================================="
echo ""

# Detect Trae version
TRAE_DIR=""
TRAE_APP_NAME=""
MCP_CONFIG_DIR=""

if [ -d "$HOME/.trae" ]; then
  TRAE_DIR="$HOME/.trae"
  TRAE_APP_NAME="Trae"
  MCP_CONFIG_DIR="$HOME/Library/Application Support/Trae/User"
  echo "✅ Detected: Trae International"
fi

if [ -d "$HOME/.trae-cn" ]; then
  if [ -n "$TRAE_DIR" ]; then
    echo "✅ Detected: Trae CN (in addition to Trae International)"
  else
    TRAE_DIR="$HOME/.trae-cn"
    TRAE_APP_NAME="Trae CN"
    MCP_CONFIG_DIR="$HOME/Library/Application Support/Trae CN/User"
    echo "✅ Detected: Trae CN"
  fi
fi

if [ -z "$TRAE_DIR" ]; then
  echo "❌ Error: Trae not detected."
  echo "   Please install Trae first: https://trae.ai"
  exit 1
fi

# Ask which version to install if both detected
if [ -d "$HOME/.trae" ] && [ -d "$HOME/.trae-cn" ]; then
  echo ""
  echo "Both Trae International and Trae CN detected."
  echo "Which one do you want to install to?"
  echo "  1) Trae International"
  echo "  2) Trae CN"
  echo "  3) Both"
  read -rp "Select [1/2/3]: " choice
  case $choice in
    1)
      TRAE_DIR="$HOME/.trae"
      TRAE_APP_NAME="Trae"
      MCP_CONFIG_DIR="$HOME/Library/Application Support/Trae/User"
      ;;
    2)
      TRAE_DIR="$HOME/.trae-cn"
      TRAE_APP_NAME="Trae CN"
      MCP_CONFIG_DIR="$HOME/Library/Application Support/Trae CN/User"
      ;;
    3)
      INSTALL_BOTH=1
      ;;
    *)
      echo "Invalid choice. Exiting."
      exit 1
      ;;
  esac
fi

install_to_trae() {
  local target_dir="$1"
  local app_name="$2"
  local mcp_dir="$3"

  echo ""
  echo "📦 Installing to $app_name..."
  echo "--------------------------------------------------"

  # 1. Install Skills
  echo "📝 Installing skills..."
  mkdir -p "$target_dir/skills"
  for skill_dir in "$ADAPTER_DIR"/skills/*/; do
    skill_name=$(basename "$skill_dir")
    target_skill_dir="$target_dir/skills/$skill_name"
    if [ -d "$target_skill_dir" ]; then
      echo "   🔄 Updating skill: $skill_name"
      rm -rf "$target_skill_dir"
    else
      echo "   ➕ Installing skill: $skill_name"
    fi
    cp -R "$skill_dir" "$target_skill_dir"
  done

  # 2. Install User Rules
  echo "📋 Installing user rules..."
  mkdir -p "$target_dir/user_rules"
  for rule_file in "$ADAPTER_DIR"/user_rules/*.md; do
    rule_name=$(basename "$rule_file")
    target_rule_file="$target_dir/user_rules/$rule_name"
    if [ -f "$target_rule_file" ]; then
      echo "   🔄 Updating rule: $rule_name"
    else
      echo "   ➕ Installing rule: $rule_name"
    fi
    cp "$rule_file" "$target_rule_file"
  done

  # 3. Update skill-config.json
  echo "⚙️  Updating skill-config.json..."
  SKILL_CONFIG="$target_dir/skill-config.json"
  if [ ! -f "$SKILL_CONFIG" ]; then
    echo '{"managedSkills":{}}' > "$SKILL_CONFIG"
  fi

  # Use Python to update JSON (more reliable than jq)
  python3 -c "
import json
import sys

try:
    with open('$SKILL_CONFIG', 'r') as f:
        config = json.load(f)
except:
    config = {'managedSkills': {}}

skills = [
    'harness-bootstrap', 'alpha-generator', 'omega-optimizer',
    'independent-evaluation', 'context-manager', 'memory-sedimentation',
    'architecture-guardian', 'evaluator', 'spec-reviewer',
    'hallucination-detector', 'code-cleaner'
]

for skill in skills:
    config.setdefault('managedSkills', {})[skill] = 'user_upload'

with open('$SKILL_CONFIG', 'w') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)
" 2>/dev/null || {
    echo "   ⚠️  Could not update skill-config.json automatically."
    echo "      Please manually add the following skills to $SKILL_CONFIG:"
    echo "      harness-bootstrap, alpha-generator, omega-optimizer,"
    echo "      independent-evaluation, context-manager, memory-sedimentation,"
    echo "      architecture-guardian, evaluator, spec-reviewer,"
    echo "      hallucination-detector, code-cleaner"
  }

  # 4. Install MCP Server
  echo "🔌 Configuring MCP Server..."
  mkdir -p "$mcp_dir"
  MCP_CONFIG="$mcp_dir/mcp.json"

  # Create or update mcp.json
  python3 -c "
import json
import os

config_path = '$MCP_CONFIG'
try:
    with open(config_path, 'r') as f:
        config = json.load(f)
except:
    config = {'mcpServers': {}}

server_entry = {
    'command': 'node',
    'args': ['$PLUGIN_DIR/adapters/trae/mcps/harness-memory/server.js'],
    'env': {
        'HARNESS_MEMORY_DIR': '$PLUGIN_DIR/memory'
    }
}

config.setdefault('mcpServers', {})['harness-memory'] = server_entry

with open(config_path, 'w') as f:
    json.dump(config, f, indent=2, ensure_ascii=False)
" 2>/dev/null || {
    echo "   ⚠️  Could not update mcp.json automatically."
    echo "      Please manually add the following to $MCP_CONFIG:"
    echo ""
    echo '      "harness-memory": {'
    echo '        "command": "node",'
    echo '        "args": ["'$PLUGIN_DIR'/adapters/trae/mcps/harness-memory/server.js"],'
    echo '        "env": { "HARNESS_MEMORY_DIR": "'$PLUGIN_DIR'/memory" }'
    echo '      }'
    echo ""
  }

  echo ""
  echo "✅ $app_name installation complete!"
}

# Install to selected version(s)
if [ "${INSTALL_BOTH:-0}" = "1" ]; then
  install_to_trae "$HOME/.trae" "Trae International" "$HOME/Library/Application Support/Trae/User"
  install_to_trae "$HOME/.trae-cn" "Trae CN" "$HOME/Library/Application Support/Trae CN/User"
else
  install_to_trae "$TRAE_DIR" "$TRAE_APP_NAME" "$MCP_CONFIG_DIR"
fi

echo ""
echo "=================================================="
echo "🎉 Harness Coding Plugin for Trae installed!"
echo ""
echo "Next steps:"
echo "  1. Restart Trae to load new skills and rules"
echo "  2. Install MCP dependencies:"
echo "     cd $PLUGIN_DIR/adapters/trae/mcps/harness-memory && npm install"
echo "  3. Start using Harness Engineering Mode in your chats"
echo ""
echo "Note: If MCP Server fails to start, ensure Node.js is available in PATH."
echo "=================================================="
