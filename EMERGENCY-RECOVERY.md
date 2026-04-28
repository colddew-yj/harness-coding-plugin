# 🚨 Emergency Recovery Guide

If opencode fails to start after harness plugin changes, follow these steps:

## Quick Fix (Run in Terminal, NOT in opencode)

### 1. Disable Harness Plugin
```bash
bash /Users/yidongwu/projects/harness-coding-plugin/scripts/disable-harness.sh
```

### 2. Validate Config
```bash
bash /Users/yidongwu/projects/harness-coding-plugin/scripts/validate-config.sh
```

### 3. Restore from Backup (if needed)
```bash
bash /Users/yidongwu/projects/harness-coding-plugin/scripts/restore-config.sh
```

### 4. Re-enable Harness (after fixing issues)
```bash
bash /Users/yidongwu/projects/harness-coding-plugin/scripts/enable-harness.sh
```

## Manual Recovery

If scripts fail, manually edit `~/.opencode/opencode.json`:

```bash
# Open config in editor
nano ~/.opencode/opencode.json

# Remove harness plugin line, keep only:
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git"
  ]
}
```

## Backup Location
All backups are stored in: `~/.opencode/backups/`

List backups:
```bash
ls -la ~/.opencode/backups/
```

## Safety Scripts Location
All scripts are in: `/Users/yidongwu/projects/harness-coding-plugin/scripts/`

| Script | Purpose |
|--------|---------|
| `backup-config.sh` | Create backup before changes |
| `disable-harness.sh` | Remove harness from config |
| `enable-harness.sh` | Add harness to config |
| `restore-config.sh` | Restore from latest backup |
| `validate-config.sh` | Validate config is valid JSON |

## Common Issues

### Issue: "Expected string | array, got object"
**Cause**: Plugin entry is object format, opencode expects string
**Fix**: Run `disable-harness.sh`, then manually edit to use string format:
```json
"/Users/yidongwu/projects/harness-coding-plugin"
```

### Issue: "Plugin not found"
**Cause**: Plugin directory doesn't exist or path is wrong
**Fix**: Verify directory exists:
```bash
ls -la /Users/yidongwu/projects/harness-coding-plugin/.opencode/plugins/harness.js
```

### Issue: "Invalid JSON"
**Cause**: Config file has syntax error
**Fix**: Run `restore-config.sh` to restore from backup
