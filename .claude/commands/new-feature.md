---
description: "Start a new feature: create branch, read ticket, plan implementation"
---

I'm starting a new feature. Help me set it up properly:

1. **Ask me for the GitHub issue number or description**

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/[short-description]
   ```

3. **Read the relevant skill files** for this task:
   - If it's frontend work: read `skills/frontend.md`
   - If it's API work: read `skills/api.md`
   - If it involves tests: read `skills/testing.md`
   - If it involves database: read `skills/database.md`

4. **Create an implementation plan** listing:
   - Files to create or modify
   - Dependencies between steps
   - Test cases needed
   - Acceptance criteria

5. **Ask me to confirm the plan** before writing any code.

Remember: commit after every prompt. One issue = one branch = one PR.
