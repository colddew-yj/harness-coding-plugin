---
name: requirement-manager
description: Use when creating or managing requirements, plans, and bugs in Obsidian vault. Triggers: "创建需求", "create requirement", "manage requirements", "add bug".
---

# Requirement Manager

Manage requirements, plans, and bugs in Obsidian vault to prevent AI from skipping tasks.

## Prerequisites

Before using this skill, verify Obsidian vault is accessible:
1. Check if `harness-requirement` tool is available
2. If tool returns "Obsidian vault not found", skip requirement management and continue with other tasks

## Usage

### Create Requirement from Text

```
使用 harness-requirement 创建需求:
项目: my-project
需求: 实现用户登录功能
验收标准:
- 支持邮箱和密码登录
- 支持记住登录状态
```

### Create Requirement from Document

```
使用 harness-requirement 创建需求:
项目: my-project
文档路径: /path/to/requirements.md
```

### Query Status

```
使用 harness-requirement 查询状态:
项目: my-project
```

## Workflow

1. **Input Parsing** — Extract project name and requirement content/path
2. **Project Confirmation** — If project is unclear, ask the user
3. **Obsidian Check** — Verify vault is accessible, skip if not
4. **Document Generation** — Create REQ, PLAN, BUG, STATUS documents
5. **Status Update** — Update STATUS.md with current state

## Rules

1. **Requirements cannot be skipped** — Only `done` or `cancelled` status removes from active list
2. **Plans must link to requirements** — PLAN files must include `requires: REQ-XXX`
3. **Bugs must be tracked** — Found bugs must create BUG files, not just verbal notes
4. **Status is auto-updated** — harness plugin maintains STATUS.md automatically

## Document Structure

```
Obsidian Vault/
└── {project}/
    ├── 01-Requirements/REQ-XXX-{title}.md
    ├── 02-Plans/PLAN-XXX-{title}.md
    ├── 03-Bugs/BUG-XXX-{title}.md
    └── 04-Status/STATUS.md
```

## Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Not started |
| `in-progress` | Being worked on |
| `done` | Completed |
| `cancelled` | Cancelled |
| `open` | Bug not fixed |
| `fixed` | Bug fixed, pending verification |
| `closed` | Bug verified and closed |
