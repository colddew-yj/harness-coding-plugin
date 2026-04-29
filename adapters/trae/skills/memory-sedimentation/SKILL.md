---
name: memory-sedimentation
description: Use when a task completes or session ends. Extract lessons learned, anti-patterns, and successful patterns for cross-session persistence.
---

# Memory Sedimentation

Memory engineering: transform experience into reusable rules.

## What is Memory?
Memory is NOT "store more stuff". Memory is:
- **Extracted rules** from specific failures
- **Verified patterns** from repeated success
- **Anti-patterns** that must be avoided
- **Architecture decisions** with their rationale

## Sedimentation Protocol

### After Task Completion
1. **Identify what happened**:
   - What was the goal?
   - What was the outcome?
   - What went wrong? What went right?

2. **Extract the rule**:
   - From specific → general
   - "X failed because Y" → "Always check Y before X"
   - Remove context-specific details, keep the pattern

3. **Classify**:
   - `lesson`: General insight worth remembering
   - `anti-pattern`: Specific mistake to avoid
   - `success-pattern`: Proven approach worth repeating
   - `architecture-decision`: Structural choice with rationale

4. **Record**:
   Use harness-memory tool or record to memory/ directory

### Rule Extraction Examples

| Experience | Extracted Rule |
|-----------|---------------|
| "Used wrong API version and spent 2h debugging" | "Always verify API version before implementation" |
| "Copied component pattern worked perfectly" | "Reuse verified component patterns, don't recreate" |
| "Putting business logic in UI caused confusion" | "Business logic belongs in service layer, never in UI" |

### Quality Criteria for Memories
- **Actionable**: Can you act on it?
- **General**: Does it apply beyond this specific case?
- **Verified**: Was it proven by experience, not guessed?
- **Concise**: Can it be stated in one sentence?
