# harness-coding-plugin

Harness Engineering 插件 — 为 AI 编程工具提供确定性可靠性。

## 核心理念

> **可靠性不来自"更聪明的模型"，而来自外部机制：拦截意图、校验结果、拒绝不合格、注入必要上下文。**

## 兼容性

| 平台 | 状态 | 说明 |
|------|------|------|
| **OpenCode** | ✅ 已适配 | 完整支持所有 hooks、skills、agents、tools |
| **Codex CLI** | 🚧 待适配 | 计划中 |
| **Trae** | 🚧 待适配 | 计划中 |
| **Cursor** | 🚧 待适配 | 计划中 |

## 安装

### 全局安装（一次配置，所有项目生效）

编辑 `~/.opencode/opencode.json`，添加插件路径：

```json
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "/path/to/harness-coding-plugin"
  ]
}
```

重启 opencode 即可。

### 推荐搭配

配合以下工具一起使用，Spec Coding 效果更佳：

- **[Karpathy Guidelines](https://github.com/karpathy)** — 强调验证优先、避免幻觉的编程原则
- **[Superpowers](https://github.com/obra/superpowers)** — 提供 brainstorming、TDD、subagent dispatch 等工作流
- **[code-review-graph](https://github.com/tirth8205/code-review-graph)** — 可视化代码审查图谱，追踪依赖与变更影响

三者配合形成完整闭环：
```
Karpathy（验证原则） + Superpowers（工作流） + Harness（可靠性保障） + code-review-graph（可视化审查） = 理想的 Spec Coding 体验
```

## 功能

### 7 个 Skills

| 技能 | 用途 |
|------|------|
| `harness-bootstrap` | 会话启动引导，激活 harness 模式 |
| `alpha-generator` | 生成提示词、技能、配置 |
| `omega-optimizer` | 优化现有提示词和技能 |
| `independent-evaluation` | 独立评估（杜绝自评幻觉） |
| `context-manager` | 动态上下文管理 |
| `memory-sedimentation` | 经验沉淀，跨任务抗重复犯错 |
| `architecture-guardian` | 架构守护，防止结构腐化 |

### 4 个 Agents

| Agent | 用途 |
|-------|------|
| `@evaluator` | 独立评估任何产物 |
| `@spec-reviewer` | 验证实现是否符合规范 |
| `@hallucination-detector` | 检测 AI 幻觉（假 API、错误假设） |
| `@code-cleaner` | 识别架构腐化，建议清理 |

### 2 个自定义工具

| 工具 | 用途 |
|------|------|
| `harness-memory` | 查询历史经验和教训 |
| `harness-reflect` | 对积累的记忆进行深度反思 |

### 5 个 Hooks

| Hook | 作用 |
|------|------|
| `config` | 注册 skills 路径，复制 agents 到全局目录 |
| `messages.transform` | 会话开始时注入历史记忆上下文 |
| `tool.execute.before` | 拦截工具调用，检查架构规则 |
| `tool.execute.after` | 记录成功/失败模式到记忆系统 |
| `event` | 监听会话状态变化 |

## 记忆系统

### JSONL（默认）

自动记录到 `memory/` 目录：
- `lessons-learned.jsonl` — 成功经验
- `anti-patterns.jsonl` — 踩坑记录

### Hindsight（可选增强）

提供语义检索、实体提取、自动反思。

> **⚠️ 使用 Hindsight 前，请先在本地启动 Hindsight 服务。**
> 插件仅在检测到 `localhost:8888` 有 Hindsight 服务运行时才会自动切换使用。

```bash
# 方式 1: Docker 启动
docker run -d --name hindsight \
  -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=your-api-key \
  -e HINDSIGHT_API_LLM_PROVIDER=openai \
  -e HINDSIGHT_API_LLM_BASE_URL=https://your-api-base-url \
  -v $HOME/.hindsight-data:/home/hindsight/.pg0 \
  ghcr.io/vectorize-io/hindsight:latest

# 方式 2: Python 启动
export OPENAI_API_KEY=your-api-key
export OPENAI_BASE_URL=https://your-api-base-url
bash hindsight/start.sh

# 访问 UI
open http://localhost:9999
```

## 需求管理

### Obsidian 需求知识库（可选）

将 Obsidian 作为产品需求文档的管理工具，与 harness 工作流无缝集成。

> **⚠️ 完全可选。** 不使用 Obsidian 不影响插件功能。

启用后，AI 会自动在 `01-Requirements/`、`02-Plans/`、`03-Bugs/`、`04-Status/` 目录下生成需求文档，格式为 Obsidian 兼容的 Markdown。

## 安全脚本

| 脚本 | 用途 |
|------|------|
| `scripts/enable-harness.sh` | 启用插件（自动备份） |
| `scripts/disable-harness.sh` | 禁用插件（自动备份） |
| `scripts/restore-config.sh` | 从备份恢复配置 |
| `scripts/validate-config.sh` | 验证配置格式 |
| `scripts/backup-config.sh` | 手动备份配置 |

## 紧急恢复

如果 opencode 无法启动：

```bash
bash /path/to/harness-coding-plugin/scripts/disable-harness.sh
```

所有备份存储在 `~/.opencode/backups/`。

## 架构

```
用户请求
  ↓
动态上下文管理 → 按意图装载技能
  ↓
α-生成器 → 生成提示词/代码
  ↓
执行层 → 实现功能
  ↓
独立评估器 → 第三方判定（非自评）
  ├─ 通过 → 继续
  └─ 失败 → 反馈重写 → 重试
  ↓
架构守护 → 检查结构性违规
  ↓
Ω-优化器 → 优化生成器本身
  ↓
记忆沉淀 → 沉淀经验规则
```

## 目录结构

```
├── .opencode/plugins/harness.js    # 主插件入口
├── agents/                         # Agent 定义
├── skills/                         # 7 个技能包
├── memory/                         # JSONL 记忆存储
├── rules/                          # 架构约束规则
├── scripts/                        # 安全运维脚本
├── hindsight/                      # Hindsight 部署配置
├── EMERGENCY-RECOVERY.md           # 紧急恢复指南
└── TEST-REPORT.md                  # 测试报告
```

## 技术栈

- **运行时**: Node.js ES Modules
- **插件系统**: OpenCode Plugin API
- **记忆系统**: JSONL（默认）/ Hindsight（可选）
- **Hindsight**: Docker 容器，运行在 localhost:8888

## License

MIT
