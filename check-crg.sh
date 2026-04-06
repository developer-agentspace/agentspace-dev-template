#!/usr/bin/env bash
# Quick health check — run anytime to verify CRG is working
set -uo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}code-review-graph health check${NC}"
echo "──────────────────────────────"

P=0; T=0
check() {
  T=$((T+1))
  if eval "$2" &>/dev/null; then echo -e "${GREEN}✓${NC} $1"; P=$((P+1))
  else echo -e "${RED}✗${NC} $1"; fi
}

PYTHON=$(command -v python3 || command -v python)

check "Python 3.10+"        "$PYTHON -c 'import sys; assert sys.version_info >= (3,10)'"
check "CRG installed"       "command -v code-review-graph"
check "Graph DB exists"     "test -f .code-review-graph/graph.db"
check "Nodes > 0"           "$PYTHON -c \"import sqlite3; assert sqlite3.connect('.code-review-graph/graph.db').execute('SELECT COUNT(*) FROM nodes').fetchone()[0] > 0\""
check "Edges > 0"           "$PYTHON -c \"import sqlite3; assert sqlite3.connect('.code-review-graph/graph.db').execute('SELECT COUNT(*) FROM edges').fetchone()[0] > 0\""
check "Communities > 0"     "$PYTHON -c \"import sqlite3; assert sqlite3.connect('.code-review-graph/graph.db').execute('SELECT COUNT(*) FROM communities').fetchone()[0] > 0\"" || true
check "igraph importable"   "$PYTHON -c 'import igraph'" || true
check "leidenalg importable" "$PYTHON -c 'import leidenalg'" || true

echo "──────────────────────────────"
echo -e "Result: ${GREEN}$P${NC}/$T passed"

# Show graph stats
if command -v code-review-graph &>/dev/null && [ -f ".code-review-graph/graph.db" ]; then
  echo ""
  code-review-graph status 2>/dev/null
fi
