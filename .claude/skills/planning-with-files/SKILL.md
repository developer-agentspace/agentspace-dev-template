---
name: planning-with-files
description: Persist implementation plans as markdown files so they survive context compaction and session restarts
---

## When to Use
Use this skill when starting any multi-step feature or task that will take more than a few prompts to complete.

## Why
Plans that live only in chat history get lost when context is compacted or when you start a new session. By writing the plan to a file, it persists permanently and any Claude session can pick it up.

## Process

### 1. Create the Plan File
When starting a feature, create a plan file at `plans/[feature-name].md`:

```markdown
# Plan: [Feature Name]
**Ticket:** #[issue number]
**Branch:** feature/[name]
**Created:** [date]
**Status:** IN PROGRESS

## Steps
- [ ] Step 1: [description] — files: [list]
- [ ] Step 2: [description] — files: [list]
- [ ] Step 3: [description] — files: [list]
- [ ] Step 4: Write tests — files: [list]
- [ ] Step 5: Self-review and PR

## Decisions
- [Record any architectural decisions made during planning]

## Blockers
- [Record any blockers discovered during implementation]
```

### 2. Update as You Go
After completing each step, check it off in the plan file and commit the update. If plans change, update the file rather than just saying it in chat.

### 3. Resume from Plan
If you start a new session or context is compacted, say: "Read plans/[feature-name].md and continue where we left off."

### 4. Close the Plan
When the feature is done and merged, update the status to COMPLETED and move the file to `plans/completed/`.

## Rules
- One plan file per feature
- Always include which files each step touches
- Update the plan file after every completed step
- Commit the plan file alongside code changes
- Never delete a plan file — move to completed/
