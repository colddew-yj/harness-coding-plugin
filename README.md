# OpenCode Harness Plugin

Harness Engineering 插件 — 为 opencode 提供确定性可靠性。

## 核心理念

> **可靠性不来自"更聪明的模型"，而来自外部机制：拦截意图、校验结果、拒绝不合格、注入必要上下文。**

## 安装

### 全局安装（一次配置，所有项目生效）

编辑 `~/.opencode/opencode.json`，添加插件路径：

```json
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "/Users/yidongwu/projects/harness-coding-plugin"
  ]
}
```

重启 opencode 即可。

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

提供语义检索、实体提取、自动反思。运行在 `localhost:8888` 时自动启用。

```bash
# 启动 Hindsight
docker start hindsight

# 访问 UI
open http://localhost:9999
```

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
bash /Users/yidongwu/projects/harness-coding-plugin/scripts/disable-harness.sh
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
