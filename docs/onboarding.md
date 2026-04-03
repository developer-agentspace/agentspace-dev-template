# New Developer Onboarding Guide

## Goal
You should be set up and producing code within 1 day of reading this guide.

## Prerequisites
- macOS or Linux
- Node.js 20+
- Git configured with GitHub access
- Claude Code CLI installed (`npm install -g @anthropic-ai/claude-code`)
- GitHub CLI installed (`brew install gh`)
- iTerm2 or any modern terminal

## Step 1: Clone and Install

```bash
git clone git@github.com:developer-agentspace/[PROJECT_REPO].git
cd [PROJECT_REPO]
cd frontend && npm install
```

## Step 2: Environment Setup

```bash
cp .env.example .env.local
# Fill in the values — ask your PM for credentials
```

## Step 3: Verify It Runs

```bash
npm run dev        # Should start on localhost:5173
npm test           # All tests should pass
npm run lint       # No errors
npx tsc --noEmit   # No type errors
```

## Step 4: Understand the System

Read these files in order:
1. `CLAUDE.md` — master instructions, coding standards, what NOT to do
2. `skills/frontend.md` — how to write React components
3. `skills/api.md` — how to talk to the backend
4. `skills/testing.md` — how to write tests
5. `docs/architecture.md` — the 4-layer workflow

## Step 5: Start Working

1. **Get assigned a GitHub Issue** from the PM
2. **Open Claude Code** in the project root: `claude`
3. Claude automatically reads CLAUDE.md and skill files
4. **Paste the issue description** into Claude Code
5. Let Claude code — intervene only when it goes off track
6. **Commit after every Claude prompt**
7. When done, prompt Claude to **self-review** against CLAUDE.md
8. Fix any issues, then **create a PR**
9. Wait for reviewer approval + SonarQube pass
10. Merge

## Rules to Remember

- No code without a ticket
- Commit after every Claude prompt
- One issue = one Claude session = one branch = one PR
- Self-review before creating PR
- No Axios, no Redux, no `any` types, no hardcoded URLs
- Tests are mandatory — 80% coverage minimum
- Never push to `main` directly

## Step 6: Configure MCP Connections

See `docs/mcp-setup.md` for detailed instructions. Quick setup:

```bash
# GitHub MCP (required)
claude mcp add --transport http github https://mcp.github.com

# Figma MCP (required for UI work)
claude mcp add --transport http figma https://mcp.figma.com
```

Verify: run `/mcp` inside Claude Code to check connection status.

## Step 7: Self-Review Process

After every coding task, before creating a PR, copy the self-review prompt from `templates/self-review-prompt.md` into Claude Code. This is Stage A of the Review Gate. It is not optional.

## Getting Help

- **Stuck on a task?** Ask Claude first, then your PM.
- **Architecture question?** Check `docs/architecture.md`, then ask the tech lead.
- **Process question?** Ask your PM.
- **Blocked by missing info?** Create a blocker comment on the GitHub Issue and flag it at standup.
