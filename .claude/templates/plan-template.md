# Plan: [FEATURE_NAME]

> **Issue:** #[NUMBER]
> **Branch:** `feature/[NUMBER]-[short-desc]`
> **Author:** [NAME]
> **Status:** draft | approved | in-progress | completed

## Goal

[One sentence — what does the user get when this is done?]

## Context

[2-3 sentences — why is this needed now? Link to the ticket, any prior art, constraints.]

## Proposed approach

### Files to create
- [ ] `path/to/file.tsx` — [what it does]

### Files to modify
- [ ] `path/to/existing.tsx` — [what changes and why]

### Dependencies between steps
1. [Step A] must happen before [Step B] because...
2. ...

## Test plan

- [ ] Unit: [component] renders in loading/error/success/empty states
- [ ] Unit: [util] handles edge cases (empty input, null, overflow)
- [ ] Integration: [flow] works end-to-end with MSW mocks
- [ ] Manual: [specific user action] → [expected result]

## Acceptance criteria

- [ ] [Observable outcome #1]
- [ ] [Observable outcome #2]
- [ ] All tests pass (`npm test`)
- [ ] Lint clean (`npm run lint`)
- [ ] Build succeeds (`npx vite build`)
- [ ] Self-review completed (`/review`)

## Risks & open questions

- [Risk or question that might change the approach]
- [Anything that needs PM/tech lead input before coding]

## Annotation cycle

> This plan follows the **annotation cycle**: write plan → get approval → implement → review → merge. Do NOT start coding until this plan is approved.

**Approval:** [ ] Approved by [REVIEWER_NAME] on [DATE]
