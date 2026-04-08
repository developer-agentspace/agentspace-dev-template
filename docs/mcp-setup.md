# MCP Setup Guide

MCP (Model Context Protocol) connections let Claude Code access external tools directly. These are configured per-machine — they cannot be committed to the repo.

## Prerequisites

- Claude Code CLI installed
- GitHub CLI installed and authenticated (`gh auth login`)
- Access to the relevant accounts (GitHub org, Figma team, database)

## GitHub MCP

Gives Claude the ability to read/write code, create branches, commit, and open PRs.

```bash
claude mcp add --transport http github https://mcp.github.com
```

**Verify it works:**
1. Open Claude Code in the project directory
2. Run `/mcp` to check connection status
3. Ask Claude: "List the open issues in this repo"

## Figma MCP

Gives Claude the ability to see UI designs and generate matching code.

```bash
claude mcp add --transport http figma https://mcp.figma.com
```

**Verify it works:**
1. Open Claude Code
2. Run `/mcp` to check connection status
3. Share a Figma URL and ask Claude to describe the design

## Database MCP (PostgreSQL)

Gives Claude the ability to query the database and understand the schema.

[FILL_PER_PROJECT — Setup depends on database hosting and access credentials. Coordinate with your tech lead.]

```bash
# Example — adjust for your setup
claude mcp add --transport stdio postgres -- npx -y @anthropic-ai/mcp-postgres --connection-string [CONNECTION_STRING]
```

**Verify it works:**
1. Open Claude Code
2. Ask Claude: "List all tables in the database"

## Slack MCP (Optional)

Gives Claude the ability to post updates and read channels.

[FILL_PER_PROJECT — Only set up if the project uses Slack for notifications.]

## Playwright MCP (Browser Control)

Gives Claude the ability to control a real browser for debugging UI issues, verifying layouts, and testing interactions live.

```bash
claude mcp add playwright -- npx @playwright/mcp@latest
```

**Verify it works:**
1. Open Claude Code
2. Ask Claude: "Open localhost:3000 in a browser and take a screenshot"
3. Claude should launch a browser and return the screenshot

## Troubleshooting

- **Connection prompt keeps appearing:** Run `/mcp` inside Claude Code to authenticate.
- **Server not responding:** Check `claude mcp list` to verify the server is configured.
- **Permission denied:** Ensure your GitHub/Figma account has access to the relevant resources.
- **Reset all approvals:** `claude mcp reset-project-choices`

## Per-Machine, Not Per-Repo

MCP connections are stored in `~/.claude.json` (local scope) or `.mcp.json` (project scope). For team-shared connections, add them to `.mcp.json` in the repo root. For personal credentials, keep them in local scope.
