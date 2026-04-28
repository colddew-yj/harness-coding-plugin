---
name: independent-evaluation
description: Use when any major artifact has been created and needs independent verification. Enforces the "never be athlete and referee" rule.
---

# Independent Evaluation

**Rule**: Never evaluate your own work. Always dispatch an independent evaluator.

## When to Evaluate
- After creating a new skill, agent, or prompt
- After implementing a feature from spec
- After significant refactoring
- When tests fail and you can't identify why
- Before marking any task complete

## Evaluation Protocol

### Step 1: Dispatch Independent Evaluator
```
@evaluator Please evaluate this artifact:
[type]: [skill/agent/prompt/code]
[content]: [full content]

Criteria:
1. Correctness: Does it do what was intended?
2. Completeness: Are there gaps or edge cases?
3. Convention: Does it follow established patterns?
4. Quality: Is it maintainable and clear?
```

### Step 2: Handle Results
- **PASS**: Proceed, record success to memory
- **FAIL**: Fix the specific issues, re-evaluate
- **NEEDS_REVISION**: Address suggestions, re-evaluate

### Step 3: Record Outcome
After evaluation completes, use harness-memory to record:
- What was evaluated
- The result (pass/fail)
- Key findings
- Date and context

## Evaluation Types

| Artifact Type | Primary Criteria | Secondary Criteria |
|--------------|------------------|-------------------|
| Skills | Triggers correct, content actionable | Format valid, follows conventions |
| Agents | Description accurate, permissions right | Model appropriate, scope clear |
| Prompts | Intent clear, output spec'd | Edge cases handled, constraints explicit |
| Code | Compiles, tests pass | Architecture clean, documented |
