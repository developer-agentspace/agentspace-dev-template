---
description: "Run the full quality gate: lint, type check, tests, and coverage"
---

Run the following commands in the frontend directory sequentially. Stop and report if any step fails.

1. Lint check:
```bash
cd frontend && npm run lint
```

2. TypeScript type check:
```bash
cd frontend && npx tsc --noEmit
```

3. Run all tests:
```bash
cd frontend && npm test -- --watchAll=false
```

4. Coverage report:
```bash
cd frontend && npm run test:coverage
```

Report the results of each step. If all pass, say "All quality checks passed. Safe to create PR."
If any fail, list the exact errors and suggest fixes.
