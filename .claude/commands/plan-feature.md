---
description: "Create a structured implementation plan before writing any code"
---

I need to plan a feature before implementing it. Help me create a plan using the annotation cycle workflow.

**Steps:**

1. **Ask me for the GitHub issue number.** Read the issue body with `gh issue view [NUMBER]`.

2. **Read the relevant skill files** based on what the ticket touches:
   - Frontend work → `skills/frontend.md`
   - API work → `skills/api.md`
   - Tests → `skills/testing.md`
   - Database → `skills/database.md`
   - Deployment → `skills/deployment.md`
   - Security-sensitive → `skills/security.md`
   - Accessibility-related → `skills/accessibility.md`

3. **Copy the plan template** from `.claude/templates/plan-template.md` and fill in every section:
   - Goal (one sentence)
   - Context (why now, constraints)
   - Proposed approach (files to create, files to modify, dependency order)
   - Test plan (unit, integration, manual)
   - Acceptance criteria (observable outcomes)
   - Risks and open questions

4. **Write the plan** to `plans/[issue-number]-[short-desc].md`.

5. **Show me the plan** and ask for approval. Do NOT start coding until I say "approved" or "go".

**Rules:**
- The plan must be specific enough that a different developer could implement it without asking questions.
- Every file listed must have a one-line description of what it does or what changes.
- The test plan must cover loading, error, success, and empty states for any data-fetching component.
- If the feature is large (>5 files), suggest splitting into sub-tickets.

This follows the annotation cycle: **plan → approve → implement → review → merge**.
