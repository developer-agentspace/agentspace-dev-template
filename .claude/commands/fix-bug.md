---
description: "Structured bug investigation: reproduce, diagnose, fix, verify"
---

I need to fix a bug. Follow this structured debugging process:

1. **Ask me to describe the bug** — what's happening vs what should happen

2. **Reproduce the issue:**
   - Read the relevant code
   - Identify the exact file and line where the problem originates
   - Explain why it's happening

3. **Diagnose the root cause:**
   - Don't guess. Trace the logic step by step.
   - Check if this is a symptom of a deeper issue
   - List all files affected by this bug

4. **Propose the fix:**
   - Explain exactly what you'll change and why
   - Ask me to confirm before making changes

5. **Implement the fix**

6. **Verify:**
   - Run the relevant tests: `cd frontend && npm test -- --watchAll=false`
   - If no test covers this bug, write one first
   - Confirm the fix doesn't break anything else

7. **Commit with a meaningful message:**
   ```
   fix: [short description of what was fixed]
   ```
