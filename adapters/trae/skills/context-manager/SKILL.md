---
name: context-manager
description: Use when context is growing large and you need to manage what stays in memory. Dynamically loads/unloads skills based on current intent.
---

# Context Manager

Context is the first principle of vibe coding. Garbage in, garbage out.

## Principles
1. **Keep it short**: Only relevant context stays in memory
2. **Load on demand**: Skills load when needed, unload when done
3. **Preserve decisions**: Architecture decisions and constraints persist
4. **Forget details, remember patterns**: Keep lessons, discard noise

## Context Management Protocol

### When Context Grows (>50% window)
1. Identify current task phase (planning/implementing/reviewing)
2. Keep only skills relevant to current phase
3. Summarize completed work into 1-2 paragraphs
4. Preserve: architecture decisions, test results, key findings

### Skill Loading/Unloading
```
Current intent: [describe what you're doing now]

Relevant skills to load:
- [skill names based on intent]

Skills to unload (no longer relevant):
- [skill names for completed phases]
```

### Memory Injection
Before starting new work:
1. Query harness-memory for related past experience
2. Inject top 3 most relevant lessons
3. Note any anti-patterns to avoid

### Compaction Survival
When context compacts:
- Architecture rules MUST survive
- Current task goal MUST survive
- Key decisions and rationale MUST survive
- Detailed code can be summarized
