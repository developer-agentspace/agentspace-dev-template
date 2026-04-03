# System Architecture — The 4-Layer Workflow

## Overview

Every task at Agent Space flows through the same 4 layers, regardless of which product is being built or which developer is doing the work.

```
┌─────────────────────────────────────────────────┐
│  Layer 1: SUPERPOWER SKILLS                     │
│  Claude loads CLAUDE.md + skill files + MCP     │
├─────────────────────────────────────────────────┤
│  Layer 2: AGENTIC BUILD LOOP                    │
│  Claude codes → runs → fixes → repeats          │
│  Developer provides 10% oversight               │
├─────────────────────────────────────────────────┤
│  Layer 3: REVIEW GATE                           │
│  Stage A: Claude self-reviews against rules     │
│  Stage B: Human reviewer approves PR            │
│  Stage C: SonarQube quality gate passes         │
├─────────────────────────────────────────────────┤
│  Layer 4: DEPLOY                                │
│  Merge to main → CI/CD → Production             │
└─────────────────────────────────────────────────┘
```

## Layer 1: Superpower Skills

Before Claude writes any code, it already knows the project. On startup, Claude Code reads:

1. **CLAUDE.md** — master instructions (tech stack, coding standards, what not to do)
2. **Skill files** — task-specific rules (`frontend.md`, `api.md`, `testing.md`, etc.)
3. **MCP connections** — live access to GitHub, Figma, database, Slack

This is a one-time setup. Once configured, every Claude session starts fully context-aware.

## Layer 2: Agentic Build Loop

The developer does NOT write code. The developer DIRECTS Claude.

1. PM or founder creates a GitHub Issue describing what to build (product-level, not code-level)
2. Developer opens Claude Code in the project directory
3. Developer pastes the issue description — Claude starts coding
4. Claude writes code → runs it → sees errors → fixes → runs again → repeats until working
5. Developer reviews the output, requests fixes if needed

**Rules:**
- Commit after every Claude prompt
- One GitHub issue = one Claude session
- Define the complete requirement upfront (waterfall, not agile iteration)
- Never start coding without a ticket

## Layer 3: Review Gate

No code reaches production without passing two stages:

**Stage A — Automated Self-Review:**
After coding, prompt Claude: "Review the code you just wrote against CLAUDE.md and the relevant skill files. Check for: standard violations, missing tests, hardcoded values, security issues, performance problems. List and fix every issue."

**Stage B — Human Review:**
Developer opens a PR on GitHub. The designated reviewer checks:
- Architectural correctness
- Security vulnerabilities
- API integration accuracy
- SonarQube compliance
- Test coverage and quality

**Stage C — SonarQube:**
Automated code quality scan. If it fails, the PR cannot be merged. Hard gate.

## Layer 4: Deploy

Once the PR is approved and all checks pass:
- Code merges to `main`
- GitHub Actions CI/CD pipeline builds and deploys
- Deployment is automated — no manual steps

## Future Vision

- **Phase 1 (now):** Developer directs every task, reviewer checks every PR
- **Phase 2 (1-2 months):** Claude handles standard tasks end-to-end, humans spot-check
- **Phase 3 (3-6 months):** Claude picks up issues autonomously, humans review flagged items only

Everything built in Phase 1 should be designed with Phase 3 in mind.

## Flow Diagram

```
REQUIREMENT (GitHub Issue)
     │
     ▼
SUPERPOWER LOAD (Claude reads CLAUDE.md + Skills + MCP)
     │
     ▼
AGENTIC BUILD LOOP (Claude codes → runs → fixes → repeats)
     │
     ▼
SELF-REVIEW (Claude reviews against CLAUDE.md and skill rules)
     │
     ▼
HUMAN REVIEW (PR → Reviewer checks → SonarQube passes)
     │
     ▼
MERGE & DEPLOY (CI/CD → Production)
```

This flow is identical for every task, every product, every developer. Only the contents of the skill files and the GitHub Issue change.
