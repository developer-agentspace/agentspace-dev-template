---
description: "Run the full pre-deployment checklist before merging"
---

Run through the complete pre-deployment checklist:

1. **All tests pass:** `cd frontend && npm test -- --watchAll=false`
2. **Coverage >= 80%:** `cd frontend && npm run test:coverage`
3. **Lint passes:** `cd frontend && npm run lint`
4. **Type check passes:** `cd frontend && npx tsc --noEmit`
5. **Build succeeds:** `cd frontend && npm run build`
6. **No console.log statements:** Search for `console.log` in `frontend/src/` — flag any found
7. **No hardcoded URLs:** Search for `http://` or `https://` in `frontend/src/` — flag any that are not in comments
8. **No .env files staged:** Check `git status` for any `.env` files
9. **No TODO or FIXME left:** Search for `TODO` and `FIXME` in `frontend/src/` — list any found
10. **Self-review done:** Confirm the code has been reviewed against CLAUDE.md

Report pass/fail for each item. If all pass, say "Deploy checklist complete. Safe to merge."
