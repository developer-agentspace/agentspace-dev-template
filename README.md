# Agent Space — Development Template

A universal, reusable development system where Claude Code writes 90% of the code, the developer provides 10% oversight, and the output is production-quality every time.

## What This Is

This is NOT a product. This is the **template architecture** that powers every product Agent Space builds. Clone this repo, fill in the project-specific sections, and your team is immediately productive.

## The 4-Layer Workflow

Every task, every product, every developer follows the same flow:

```
1. SUPERPOWER SKILLS    → Claude loads CLAUDE.md + skill files + MCP connections
2. AGENTIC BUILD LOOP   → Claude codes autonomously, developer provides 10% oversight
3. REVIEW GATE          → Claude self-reviews, then human reviewer approves PR
4. DEPLOY               → Merge to main, CI/CD deploys to production
```

## Quick Start (New Project)

1. Clone this repo as your project base
2. Search for `[PROJECT_NAME]` and fill in all placeholder sections
3. Update skill files in `/skills/` with project-specific endpoints, schemas, etc.
4. Run `cd frontend && npm install && npm run dev`
5. Open Claude Code in the project root — it reads `CLAUDE.md` automatically
6. Start building

## Repo Structure

```
├── CLAUDE.md                     # Master instructions for Claude Code
├── /skills/                      # Task-specific instruction files
│   ├── frontend.md               # React/TypeScript/Tailwind rules
│   ├── api.md                    # Backend API integration rules
│   ├── testing.md                # Testing standards
│   ├── database.md               # Database schema and query patterns
│   └── deployment.md             # Deployment process and checklist
├── /docs/                        # Technical documentation
│   ├── architecture.md           # System architecture overview (4 layers)
│   └── onboarding.md             # New developer setup guide
├── /frontend/                    # React 18 + TypeScript + Tailwind starter app
├── /templates/                   # Reusable component templates
├── .github/                      # CI/CD, PR templates, issue templates
│   ├── /ISSUE_TEMPLATE/          # Standardized ticket formats
│   └── /workflows/               # GitHub Actions pipelines
└── sonarqube-config/             # Code quality gate configuration
```

## Key Principles

- **No code without a ticket.** Every task starts as a GitHub Issue.
- **Commit after every Claude prompt.** Version control insurance.
- **One issue = one Claude session.** Don't mix tasks.
- **Self-review before PR.** Claude reviews its own code against skill rules first.
- **Templates, not one-offs.** 80-90% of config is fixed. Only 10-20% changes per project.

## Customization

Files marked with `[PLACEHOLDER]` tags contain project-specific sections. Search for:
- `[PROJECT_NAME]` — your project's name
- `[PROJECT_DESCRIPTION]` — what the product does
- `[API_BASE_URL]` — backend base URL
- `[FILL_PER_PROJECT]` — any section needing project-specific content

See each file's `PROJECT-SPECIFIC SECTION` blocks for details.
