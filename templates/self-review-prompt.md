# Self-Review Prompt

Use this prompt after Claude finishes coding a task, before creating a PR. Copy-paste it into Claude Code.

---

```
Review the code you just wrote against our CLAUDE.md standards and the relevant skill files.

Check for:
1. Coding standard violations (naming, imports, file structure)
2. Missing test cases
3. Hardcoded values (URLs, secrets, magic numbers)
4. Security issues (exposed credentials, XSS, injection)
5. Performance problems (unnecessary re-renders, missing memoization, large bundles)
6. Accessibility issues (missing labels, keyboard navigation, contrast)
7. TypeScript issues (any types, missing return types, loose typing)
8. Console.log statements or debug code left in
9. Unused imports or variables
10. Error handling gaps (missing loading/error/empty states)

List every issue you find, then fix them all. After fixing, confirm the code passes:
- npm run lint
- npx tsc --noEmit
- npm test
```

---

## When to Use

- After every coding task, before creating a PR
- This is Stage A of the Review Gate (Layer 3)
- This is NOT optional — every task must go through self-review
