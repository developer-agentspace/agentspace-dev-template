---
description: "3-pass self-review against CLAUDE.md and skill files before creating a PR"
---

Run a structured 3-pass self-review of the code you just wrote. Each pass focuses on a different category so nothing gets missed.

---

## Pass 1: Standards Compliance

Review against CLAUDE.md and the relevant skill files. Check for:

1. **Naming** — camelCase vars/functions, PascalCase components/types, UPPER_SNAKE constants
2. **Imports** — correct order (React → libs → internal → hooks → utils → types), no unused
3. **File structure** — one component per file, under 150 lines, correct directory
4. **TypeScript** — no `any`, explicit return types, `interface` for objects, `type` for unions
5. **Tailwind** — no inline styles, no hardcoded hex, using the project's design tokens
6. **Console** — no `console.log/info/warn/error` — use the structured `logger` instead
7. **Hardcoded values** — no magic numbers, no hardcoded URLs, no secrets
8. **Data fetching** — React Query, never `useEffect` + `fetch`

**List every violation found, then fix them all.**

---

## Pass 2: Security Review

Review against `skills/security.md`. Check for:

1. **Auth tokens** — not stored in localStorage or sessionStorage
2. **User input** — sanitized before rendering as HTML or inserting into URLs
3. **XSS** — no `dangerouslySetInnerHTML` without DOMPurify
4. **PII** — no emails, names, phone numbers, addresses in logs, errors, analytics, or Sentry
5. **Secrets** — no API keys, tokens, or credentials in the code
6. **Dependencies** — any new dependency justified and vetted? `npm audit` clean?
7. **CORS / CSRF** — handled if the change touches API calls
8. **Content-Type** — not hardcoded for non-JSON bodies

**List every issue found, then fix them all.**

---

## Pass 3: Edge Cases & Accessibility

Review against `skills/testing.md` and `skills/accessibility.md`. Check for:

1. **Loading state** — every data-fetching component shows a skeleton
2. **Error state** — friendly message + retry button, never raw error objects
3. **Empty state** — helpful message when data is empty, not a blank page
4. **Null / undefined** — does the code handle missing data gracefully?
5. **Boundary values** — empty strings, zero, very long strings, special characters
6. **Keyboard** — every interactive element reachable via Tab, focus visible
7. **Labels** — every form input has an associated `<label>` with `htmlFor`
8. **Semantic HTML** — `<button>` not `<div onClick>`, `<a>` for navigation
9. **Color** — not the only signal for state (pair with icons or text)
10. **Alt text** — every image has `alt` (or `alt=""` if decorative)

**List every issue found, then fix them all.**

---

## After all 3 passes

Confirm the code passes:
```bash
npm run lint
npx tsc --noEmit
npm test
```

Report: **"3-pass review complete. [N] issues found and fixed. All checks green."**
