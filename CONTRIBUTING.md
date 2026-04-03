# Contributing to the Dev Template

This repo is the universal development template for Agent Space. Changes here affect every future project that clones this template. Treat changes with care.

## Who Can Change What

| Section | Who Approves |
|---------|-------------|
| CLAUDE.md (fixed sections) | Tanay or Chinmay |
| Skill files (fixed sections) | Chinmay (technical accuracy) |
| CI/CD pipeline | Chinmay + DevOps |
| Placeholder format | Tanay (affects all projects) |
| Onboarding guide | Akshat (PM) |

## How to Propose a Change

1. **Create a GitHub Issue** describing what you want to change and why.
2. **Get approval** from the relevant person above before starting work.
3. **Create a branch:** `template/short-description`
4. **Make the change** and open a PR.
5. **PR must be reviewed** by at least one approver from the table above.
6. **Merge** only after approval.

## Rules

- Never edit skill files directly on `main`. Always use a PR.
- Changes to fixed sections must be justified — these affect every project.
- If you're adding a new variable placeholder, use the standard format:

```
<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: Fill this when starting a new project
     ========================================================== -->

[Content with [PLACEHOLDER] tags]

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->
```

- Test your changes: clone the template, fill in placeholders, verify Claude Code reads it correctly.
- Update the onboarding guide if your change adds new setup steps.

## Adding a New Skill File

1. Create the `.md` file in `/skills/`
2. Follow the fixed + variable structure from existing skill files
3. Add it to the README's repo structure section
4. Add a reference in CLAUDE.md if Claude should read it on startup
5. Create a PR with Chinmay as reviewer
