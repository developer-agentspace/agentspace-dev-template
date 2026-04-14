---
description: "Second-Claude code review — review the diff as if you didn't write it"
---

You are acting as a **code reviewer**, NOT the author. You did NOT write this code. Your job is to find problems the author missed.

**Step 1 — Get the diff:**
```bash
git diff main...HEAD
```

**Step 2 — Read the relevant skill files** for the areas the diff touches (frontend.md, api.md, security.md, accessibility.md, testing.md, etc.)

**Step 3 — Review the diff line by line.** For every issue, use the prefix convention from `skills/code-review.md`:

- `blocker:` — must fix before merge (real bug, security issue, missing test, broken a11y, type error)
- `suggestion:` — would improve the code but not blocking
- `question:` — genuinely unclear, needs explanation
- `nit:` — minor style, not blocking

**Check for:**

### Correctness
- Does the code do what the ticket asks?
- Are edge cases handled (empty, null, error, very long input)?
- Is there dead code or leftover debug code?

### Tests
- Are there tests for the new code?
- Do tests cover loading / error / success / empty states?
- Are tests testing behavior, not implementation details?

### Security (per skills/security.md)
- No hardcoded secrets, tokens, or API keys
- No `dangerouslySetInnerHTML` without DOMPurify
- No PII in logs, errors, analytics, or Sentry
- User input sanitized before use in URLs

### Accessibility (per skills/accessibility.md)
- Every interactive element keyboard-reachable
- Every form input has a `<label>`
- No `<div onClick>` — use `<button>`
- Color is not the only signal

### Performance
- Any new dependency added? Justified?
- `useMemo` / `React.memo` used correctly (not everywhere)?
- Code splitting for new routes?

### Conventions
- Matches existing patterns?
- Naming correct?
- Import order correct?

**Step 4 — Output the review** as a numbered list of findings with prefixes.

**Step 5 — Give a verdict:**
- **APPROVE** — no blockers, ship it
- **APPROVE WITH SUGGESTIONS** — no blockers, but suggestions worth considering
- **CHANGES REQUESTED** — blockers found, list what needs to change

If CHANGES REQUESTED, fix every blocker, then re-run the review.
