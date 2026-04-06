#!/bin/bash
if command -v code-review-graph &> /dev/null && [ -d ".code-review-graph" ]; then
  code-review-graph query --summary 2>/dev/null || echo "Knowledge graph loaded but summary not available. Try: code-review-graph status"
else
  echo "Knowledge graph not built yet. Run: pip install code-review-graph && code-review-graph build"
fi
