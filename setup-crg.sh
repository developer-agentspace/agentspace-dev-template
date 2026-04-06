#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# code-review-graph — Automated Setup Script
# Works on: Ubuntu/Debian, macOS, WSL2
# Usage: bash setup-crg.sh [--with-communities] [--with-embeddings] [--with-all]
# ─────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

INSTALL_COMMUNITIES=false
INSTALL_EMBEDDINGS=false
for arg in "$@"; do
  case $arg in
    --with-communities) INSTALL_COMMUNITIES=true ;;
    --with-embeddings)  INSTALL_EMBEDDINGS=true ;;
    --with-all)         INSTALL_COMMUNITIES=true; INSTALL_EMBEDDINGS=true ;;
  esac
done

# ── Step 1: Check Python ──
info "Checking Python..."
PYTHON=""
for cmd in python3 python; do
  if command -v "$cmd" &>/dev/null; then
    ver=$("$cmd" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>/dev/null)
    major=$("$cmd" -c "import sys; print(sys.version_info.major)" 2>/dev/null)
    minor=$("$cmd" -c "import sys; print(sys.version_info.minor)" 2>/dev/null)
    if [ "$major" -ge 3 ] && [ "$minor" -ge 10 ]; then
      PYTHON="$cmd"
      ok "Python $ver found ($cmd)"
      break
    fi
  fi
done
[ -z "$PYTHON" ] && fail "Python 3.10+ required. Install from https://python.org"

# ── Step 2: Detect install method ──
USE_PIPX=false
if command -v code-review-graph &>/dev/null; then
  ok "code-review-graph already installed ($(code-review-graph --version 2>/dev/null || echo 'unknown version'))"
  # Detect if installed via pipx
  if pipx list 2>/dev/null | grep -q "code-review-graph"; then
    USE_PIPX=true
    info "Installed via pipx"
  else
    info "Installed via pip"
  fi
else
  info "Installing code-review-graph..."

  # Try pip first
  if $PYTHON -m pip install code-review-graph 2>/dev/null; then
    ok "Installed via pip"
  else
    # pip blocked (PEP 668) — use pipx
    warn "pip blocked by system (PEP 668). Trying pipx..."
    if ! command -v pipx &>/dev/null; then
      info "Installing pipx..."
      if command -v apt &>/dev/null; then
        sudo apt install -y pipx 2>/dev/null || $PYTHON -m pip install --user pipx
      elif command -v brew &>/dev/null; then
        brew install pipx
      else
        $PYTHON -m pip install --user pipx
      fi
      pipx ensurepath 2>/dev/null || true
      export PATH="$HOME/.local/bin:$PATH"
    fi
    pipx install code-review-graph
    USE_PIPX=true
    ok "Installed via pipx"
  fi
fi

# Verify on PATH
if ! command -v code-review-graph &>/dev/null; then
  export PATH="$HOME/.local/bin:$PATH"
  if ! command -v code-review-graph &>/dev/null; then
    fail "code-review-graph not found on PATH. Run: pipx ensurepath && source ~/.bashrc"
  fi
fi

# ── Step 3: Configure MCP server ──
info "Configuring MCP server..."
# Detect platform
PLATFORM="claude-code"
if [ -d "$HOME/.cursor" ] || [ -d "$HOME/Library/Application Support/Cursor" ]; then
  PLATFORM="all"
fi
code-review-graph install --platform "$PLATFORM" --no-hooks 2>/dev/null || \
  code-review-graph install --platform claude-code --no-hooks 2>/dev/null || \
  warn "Could not auto-configure MCP. Run manually: code-review-graph install --no-hooks"
ok "MCP server configured for $PLATFORM"

# ── Step 4: Build graph ──
if [ ! -f ".code-review-graph/graph.db" ]; then
  info "Building knowledge graph (first build)..."
  code-review-graph build
else
  info "Graph exists. Running incremental update..."
  code-review-graph update --base HEAD~5 2>/dev/null || code-review-graph build
fi

# Show stats
echo ""
code-review-graph status
echo ""

# ── Step 5: Install extras ──
install_extra() {
  local name="$1"
  shift
  local deps=("$@")

  info "Installing $name..."
  if $USE_PIPX; then
    pipx inject code-review-graph "${deps[@]}"
  else
    $PYTHON -m pip install "code-review-graph[$name]" 2>/dev/null || \
      $PYTHON -m pip install "${deps[@]}"
  fi
  ok "$name installed"
}

if $INSTALL_COMMUNITIES; then
  install_extra "communities" igraph leidenalg

  info "Rebuilding graph with community detection..."
  code-review-graph build

  # Workaround: v2.1.0 may not auto-trigger Leiden
  info "Running community detection (v2.1.0 workaround)..."

  # Detect the right Python — pipx venv or system
  CRG_PYTHON="$PYTHON"
  if $USE_PIPX; then
    PIPX_PYTHON="$HOME/.local/share/pipx/venvs/code-review-graph/bin/python"
    if [ -f "$PIPX_PYTHON" ]; then
      CRG_PYTHON="$PIPX_PYTHON"
    fi
  fi

  $CRG_PYTHON -c "
import sys, glob
try:
    from code_review_graph.graph import GraphStore
    from code_review_graph.communities import detect_communities, store_communities
    dbs = glob.glob('.code-review-graph/graph.db')
    if not dbs:
        print('No graph DB found — skipping community detection')
        sys.exit(0)
    gs = GraphStore(dbs[0])
    comms = detect_communities(gs)
    store_communities(gs, comms)
    print(f'Communities detected: {len(comms)}')
except ImportError as e:
    print(f'Import failed: {e}')
    print('Try restarting your AI tool, then run: code-review-graph build')
except Exception as e:
    print(f'Community detection failed: {e}')
" 2>/dev/null || warn "Community detection workaround failed. Restart AI tool + rebuild."
fi

if $INSTALL_EMBEDDINGS; then
  warn "Embeddings require PyTorch (~2GB download). This will take 5-10 minutes."
  read -p "Continue? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    install_extra "embeddings" sentence-transformers
    ok "Embeddings installed. Run embed_graph MCP tool to compute vectors."
  else
    info "Skipped embeddings."
  fi
fi

# ── Step 6: Add .gitignore entries ──
if [ -f ".gitignore" ]; then
  IGNORE_ENTRIES=(
    ".code-review-graph/"
    "setup-crg.sh"
    "setup-crg.ps1"
    "check-crg.sh"
    "crg-cheatsheet.pdf"
    "CRG-README.md"
    ".cursorrules"
    ".opencode.json"
    ".windsurfrules"
    "GEMINI.md"
  )
  ADDED=0
  for entry in "${IGNORE_ENTRIES[@]}"; do
    if ! grep -qxF "$entry" .gitignore 2>/dev/null; then
      if [ $ADDED -eq 0 ]; then
        echo -e "\n# code-review-graph" >> .gitignore
      fi
      echo "$entry" >> .gitignore
      ADDED=$((ADDED + 1))
    fi
  done
  if [ $ADDED -gt 0 ]; then
    ok "Added $ADDED entries to .gitignore"
  fi
fi

# ── Step 7: Health check ──
echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  Health Check${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

PASS=0; TOTAL=0

check() {
  TOTAL=$((TOTAL + 1))
  if eval "$2" &>/dev/null; then
    ok "$1"
    PASS=$((PASS + 1))
  else
    warn "$1 — FAILED"
  fi
}

check "code-review-graph on PATH" "command -v code-review-graph"
check "Graph DB exists" "test -f .code-review-graph/graph.db"
check "Nodes > 0" "$PYTHON -c \"
import sqlite3; db=sqlite3.connect('.code-review-graph/graph.db')
n=db.execute('SELECT COUNT(*) FROM nodes').fetchone()[0]
assert n > 0, f'nodes={n}'
\""
check "Edges > 0" "$PYTHON -c \"
import sqlite3; db=sqlite3.connect('.code-review-graph/graph.db')
n=db.execute('SELECT COUNT(*) FROM edges').fetchone()[0]
assert n > 0, f'edges={n}'
\""

if $INSTALL_COMMUNITIES; then
  check "Communities > 0" "$PYTHON -c \"
import sqlite3; db=sqlite3.connect('.code-review-graph/graph.db')
n=db.execute('SELECT COUNT(*) FROM communities').fetchone()[0]
assert n > 0, f'communities={n}'
\""
fi

echo ""
echo -e "${GREEN}Passed: $PASS/$TOTAL${NC}"

if [ "$PASS" -eq "$TOTAL" ]; then
  echo ""
  echo -e "${GREEN}Setup complete. Your AI assistant can now use the knowledge graph.${NC}"
  echo ""
  echo "Quick test — ask your AI:"
  echo '  "Use detect_changes to review my recent changes"'
  echo '  "Use query_graph to find callers of <function_name>"'
  echo '  "Use find_large_functions with min_lines=100"'
else
  echo ""
  warn "Some checks failed. See warnings above."
fi
