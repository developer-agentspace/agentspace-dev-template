# code-review-graph — Dev Kit

AI knowledge graph for your codebase. Gives your AI assistant (Claude Code, Cursor, etc.) structural understanding — callers, dependencies, test coverage, blast radius — without reading every file.

## Quick Start

### Windows (PowerShell)
```powershell
cd your-project
.\setup-crg.ps1                          # basic install
.\setup-crg.ps1 -WithCommunities         # + architecture view
.\setup-crg.ps1 -WithAll                  # + semantic search (2GB download)
```

### Linux / macOS / WSL
```bash
cd your-project
bash setup-crg.sh                         # basic install
bash setup-crg.sh --with-communities      # + architecture view
bash setup-crg.sh --with-all              # + semantic search (2GB download)
```

### Health Check
```bash
bash check-crg.sh                         # run anytime to verify
```

## What's in this kit

| File | Purpose |
|------|---------|
| `setup-crg.sh` | Setup script for Linux/macOS/WSL |
| `setup-crg.ps1` | Setup script for Windows |
| `check-crg.sh` | Health check (run anytime) |
| `CLAUDE.md` | Drop into project root — tells AI which tools to use |
| `crg-cheatsheet.pdf` | One-page visual reference |
| `.github/workflows/test-crg.yml` | CI workflow to validate on Windows + Ubuntu |

## What the setup script does

1. Detects OS and Python version
2. Installs `code-review-graph` (pip on Windows, pipx on Linux)
3. Configures MCP server for your AI tool
4. Builds the knowledge graph
5. Optionally installs extras (communities, embeddings)
6. Runs community detection workaround (v2.1.0 bug)
7. Adds `.code-review-graph/` to `.gitignore`
8. Runs health check

## What works after setup

**13 tools work immediately** — code review, search, impact analysis, refactoring.

**5 tools need `--with-communities`** — architecture overview, module clusters.

**3 tools are broken in v2.1.0** — flow analysis (trace_flows TypeError). Skip these.

## Known Issues (v2.1.0)

| Issue | Impact | Workaround |
|-------|--------|------------|
| `architecture_overview` returns empty | Misleading — no error | Install communities extra |
| `build` doesn't trigger Leiden | Communities stay 0 | Setup script handles this automatically |
| `trace_flows` TypeError | Flows completely broken | No fix — wait for v2.2+ |
| Over-clustering (400+ for 500 files) | Token overflow | Use `min_size=20` param |
| `crg` is wrong package name | Installs different package | Always use `code-review-graph` |
| PEP 668 on Linux | pip blocked | Setup script auto-detects, uses pipx |
| MCP server caches old env | Extras don't activate | Restart AI tool after installing extras |

## For CI

Copy `.github/workflows/test-crg.yml` into your repo. Tests install + build + communities on both Windows and Ubuntu. Trigger manually from Actions tab.
