# Trae Adapter for Harness Coding Plugin

Harness Engineering 插件的 Trae 适配层。

## 功能映射

| 原功能 (OpenCode) | Trae 实现方式 | 状态 |
|------------------|--------------|------|
| 7 个 Skills | `~/.trae/skills/` 目录 | ✅ |
| 4 个 Agents | 作为 Skills 安装 | ✅ |
| 计划提示 (messages.transform) | 全局 User Rule | ✅ |
| 记忆召回 (messages.transform) | MCP Server `harness_memory_query` | ✅ |
| 架构保护 (tool.execute.before) | User Rule 提示检查 | ⚠️ 近似 |
| 错误记录 (tool.execute.after) | MCP Server `harness_memory_retain` | ✅ |
| harness-memory 工具 | MCP Server | ✅ |

## 安装

```bash
bash scripts/install-trae.sh
```

安装脚本会自动：
1. 检测 Trae 版本（国际版/国内版）
2. 安装 11 个 skills 到 `~/.trae/skills/`
3. 安装全局 User Rule 到 `~/.trae/user_rules/`
4. 注册 MCP Server 到 `mcp.json`
5. 更新 `skill-config.json`

安装后**重启 Trae**生效。

## 手动安装

如果自动安装失败，可以手动复制：

### 1. Skills

将 `adapters/trae/skills/` 下的所有目录复制到 `~/.trae/skills/`（或 `~/.trae-cn/skills/`）。

### 2. User Rules

将 `adapters/trae/user_rules/harness-engineering.md` 复制到 `~/.trae/user_rules/`。

### 3. MCP Server

编辑 `~/Library/Application Support/Trae/User/mcp.json`（国内版为 `Trae CN`），添加：

```json
{
  "mcpServers": {
    "harness-memory": {
      "command": "node",
      "args": ["/path/to/harness-coding-plugin/adapters/trae/mcps/harness-memory/server.js"],
      "env": {
        "HARNESS_MEMORY_DIR": "/path/to/harness-coding-plugin/memory"
      }
    }
  }
}
```

然后安装依赖：

```bash
cd adapters/trae/mcps/harness-memory
npm install
```

### 4. Skill Config

编辑 `~/.trae/skill-config.json`，确保包含所有 harness skills：

```json
{
  "managedSkills": {
    "harness-bootstrap": "user_upload",
    "alpha-generator": "user_upload",
    "omega-optimizer": "user_upload",
    "independent-evaluation": "user_upload",
    "context-manager": "user_upload",
    "memory-sedimentation": "user_upload",
    "architecture-guardian": "user_upload",
    "evaluator": "user_upload",
    "spec-reviewer": "user_upload",
    "hallucination-detector": "user_upload",
    "code-cleaner": "user_upload"
  }
}
```

## 使用方式

安装完成后，Trae 会在每次对话时自动应用 Harness Engineering Mode 的规则：

1. **编码场景识别**：自动判断是否是编码任务
2. **计划提示**：复杂任务建议先出计划
3. **记忆查询**：自动查询相关历史经验
4. **独立评估**：完成后调用 `@evaluator` 评估

### 手动调用技能

在对话中直接提及技能名即可触发：
- `@harness-bootstrap` — 激活 harness 模式
- `@evaluator` — 独立评估
- `@architecture-guardian` — 架构守护
- 等等

### 使用记忆工具

MCP 工具会自动出现在 Trae 的工具列表中：
- `harness_memory_query` — 查询历史经验
- `harness_memory_retain` — 记录新经验

## 与 OpenCode 的差异

| 特性 | OpenCode | Trae |
|------|----------|------|
| Hooks (自动拦截) | ✅ 完整支持 | ❌ 不支持 |
| 计划提示 | 自动注入 | 通过 User Rule 近似 |
| 架构保护 | 自动拦截 | 仅提示 |
| 记忆召回 | 自动注入 | 需手动调用 MCP 工具 |
| Skills | ✅ | ✅ |
| Agents | ✅ | ✅（作为 Skills） |

## 故障排除

### MCP Server 无法启动

1. 确保 Node.js 已安装且在 PATH 中
2. 运行 `cd adapters/trae/mcps/harness-memory && npm install`
3. 检查 `HARNESS_MEMORY_DIR` 环境变量是否指向正确的 memory 目录

### Skills 未生效

1. 确认 skill-config.json 已更新
2. 重启 Trae
3. 检查 `~/.trae/skills/` 目录下是否存在对应的 skill 文件夹

### User Rules 未生效

1. 确认 `~/.trae/user_rules/harness-engineering.md` 存在
2. 重启 Trae
