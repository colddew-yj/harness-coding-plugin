# harness-coding-plugin

Harness Engineering Plugin — Bringing deterministic reliability to AI coding tools.

## Core Philosophy

> **Reliability doesn't come from "smarter models" but from external mechanisms: intercept intent, validate results, reject failures, inject necessary context.**

## Compatibility

| Platform | Status | Notes |
|----------|--------|-------|
| **OpenCode** | ✅ Supported | Full support for all hooks, skills, agents, tools |
| **Trae** | ✅ Supported | Skills + User Rules + MCP, see `adapters/trae/` |
| **Codex CLI** | 🚧 Planned | Coming soon |
| **Cursor** | 🚧 Planned | Coming soon |

## Installation

### OpenCode (Recommended)

Edit `~/.opencode/opencode.json` and add the plugin path:

```json
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "/path/to/harness-coding-plugin"
  ]
}
```

Restart opencode and you're done.

### Trae

```bash
bash scripts/install-trae.sh
```

The installer auto-detects Trae version (International / CN), installs skills, user rules, and MCP Server.

See [`adapters/trae/README.md`](adapters/trae/README.md) for details.

### Recommended Stack

For the best Spec Coding experience, combine with:

- **[Karpathy Guidelines](https://github.com/karpathy)** — Verification-first, hallucination-avoidance principles
- **[Superpowers](https://github.com/obra/superpowers)** — Workflows for brainstorming, TDD, subagent dispatch
- **[code-review-graph](https://github.com/tirth8205/code-review-graph)** — Visual code review graph for tracking dependencies and change impact

Together they form a complete closed loop:
```
Karpathy (verification principles) + Superpowers (workflows) + Harness (reliability) + code-review-graph (visual review) = Ideal Spec Coding
```

## Features

### 7 Skills

| Skill | Purpose |
|-------|---------|
| `harness-bootstrap` | Session bootstrap, activates harness mode |
| `alpha-generator` | Generate prompts, skills, configurations |
| `omega-optimizer` | Optimize existing prompts and skills |
| `independent-evaluation` | Independent evaluation (eliminate self-assessment hallucination) |
| `context-manager` | Dynamic context management |
| `memory-sedimentation` | Experience sedimentation, cross-session anti-repeat-failure |
| `architecture-guardian` | Architecture guard, prevent structural decay |

### 4 Agents

| Agent | Purpose |
|-------|---------|
| `@evaluator` | Independent evaluation of any artifact |
| `@spec-reviewer` | Verify implementation matches specification |
| `@hallucination-detector` | Detect AI hallucination (fake APIs, wrong assumptions) |
| `@code-cleaner` | Identify architectural decay, suggest cleanup |

### 2 Custom Tools

| Tool | Purpose |
|------|---------|
| `harness-memory` | Query historical experiences and lessons |
| `harness-reflect` | Deep reflection on accumulated memories |

### 5 Hooks

| Hook | Purpose |
|------|---------|
| `config` | Register skills paths, copy agents to global directory |
| `messages.transform` | Inject historical memory context at session start |
| `tool.execute.before` | Intercept tool calls, check architecture rules |
| `tool.execute.after` | Record success/failure patterns to memory system |
| `event` | Listen for session state changes |

## Memory System

### JSONL (Default)

Automatically records to `memory/` directory:
- `lessons-learned.jsonl` — Success patterns
- `anti-patterns.jsonl` — Failure records

### Hindsight (Optional Enhancement)

Provides semantic search, entity extraction, automated reflection.

> **⚠️ Before using Hindsight, you must start the Hindsight service locally.**
> The plugin only switches to Hindsight when it detects a running service at `localhost:8888`.

```bash
# Option 1: Docker
docker run -d --name hindsight \
  -p 8888:8888 -p 9999:9999 \
  -e HINDSIGHT_API_LLM_API_KEY=your-api-key \
  -e HINDSIGHT_API_LLM_PROVIDER=openai \
  -e HINDSIGHT_API_LLM_BASE_URL=https://your-api-base-url \
  -v $HOME/.hindsight-data:/home/hindsight/.pg0 \
  ghcr.io/vectorize-io/hindsight:latest

# Option 2: Python
export OPENAI_API_KEY=your-api-key
export OPENAI_BASE_URL=https://your-api-base-url
bash hindsight/start.sh

# Access UI
open http://localhost:9999
```

## Safety Scripts

| Script | Purpose |
|--------|---------|
| `scripts/enable-harness.sh` | Enable plugin (auto-backup) |
| `scripts/disable-harness.sh` | Disable plugin (auto-backup) |
| `scripts/restore-config.sh` | Restore config from backup |
| `scripts/validate-config.sh` | Validate config format |
| `scripts/backup-config.sh` | Manual config backup |

## Emergency Recovery

If opencode fails to start:

```bash
bash /path/to/harness-coding-plugin/scripts/disable-harness.sh
```

All backups are stored in `~/.opencode/backups/`.

## Architecture

```
User Request
  ↓
Dynamic Context Manager → Load skills by intent
  ↓
α-Generator → Generate prompts/code
  ↓
Executor → Implement feature
  ↓
Independent Evaluator → Third-party judgment (NOT self-eval)
  ├─ Pass → Continue
  └─ Fail → Feedback → Retry
  ↓
Architecture Guardian → Check structural violations
  ↓
Ω-Optimizer → Optimize the generator itself
  ↓
Memory Sedimentation → Extract lessons for future
```

## Directory Structure

```
├── .opencode/plugins/harness.js    # Main plugin entry (OpenCode)
├── adapters/                       # Platform adapters
│   └── trae/                       # Trae adapter (Skills + Rules + MCP)
├── agents/                         # Agent definitions
├── skills/                         # 7 skill packages
├── memory/                         # JSONL memory storage
├── rules/                          # Architecture constraint rules
├── scripts/                        # Safety operation scripts
├── hindsight/                      # Hindsight deployment config
├── EMERGENCY-RECOVERY.md           # Emergency recovery guide
└── TEST-REPORT.md                  # Test report
```

## Tech Stack

- **Runtime**: Node.js ES Modules
- **Plugin System**: OpenCode Plugin API
- **Memory**: JSONL (default) / Hindsight (optional)
- **Hindsight**: Docker container, running on localhost:8888

## License

MIT
