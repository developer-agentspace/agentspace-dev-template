---
description: "Plan a parallel multi-terminal workflow for a feature"
---

I want to split a feature across multiple Claude Code terminals for parallel development.

1. **Ask me what feature I'm building**

2. **Analyze the feature and split it into 3-4 independent tasks** where each task touches different files. No two tasks should edit the same file.

3. **Output a table like this:**

| Terminal | Task | Files to Create/Edit |
|---|---|---|
| 1 | [task description] | [file paths] |
| 2 | [task description] | [file paths] |
| 3 | [task description] | [file paths] |
| 4 | [research/review — read only] | [no file changes] |

4. **For each terminal, write the exact prompt** I should paste into that Claude Code session.

5. **Remind me:**
   - All terminals work on the same branch
   - Commit frequently from each terminal
   - Terminal 4 is always read-only (review/research)
   - If there's a conflict, stash and pull first
