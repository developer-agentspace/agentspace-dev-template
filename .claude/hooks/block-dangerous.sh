#!/usr/bin/env bash
# PreToolUse hook — blocks dangerous commands before execution.
#
# Registered in .claude/settings.json under hooks.PreToolUse.
# Exit 2 = block the tool call. Exit 0 = allow it.
#
# What this blocks:
#   - rm -rf / or rm -rf ~ (catastrophic deletes)
#   - git push --force to main/master
#   - git reset --hard on main/master
#   - DROP TABLE / DROP DATABASE (accidental SQL)
#   - chmod 777 (world-writable permissions)
#   - Direct npm publish (should go through CI)

set -euo pipefail

# The tool input is passed via stdin as JSON.
INPUT=$(cat)

# Extract the command string from the tool input.
COMMAND=$(echo "$INPUT" | grep -oP '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/"command"\s*:\s*"//;s/"$//' 2>/dev/null || echo "")

if [ -z "$COMMAND" ]; then
  exit 0
fi

# --- Dangerous patterns ---

# Catastrophic rm
if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+(/|~|/home)'; then
  echo "BLOCKED: rm -rf on root or home directory. This would delete everything." >&2
  exit 2
fi

# Force push to main/master
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force.*\s+(main|master)'; then
  echo "BLOCKED: force push to main/master. This rewrites shared history." >&2
  exit 2
fi
if echo "$COMMAND" | grep -qE 'git\s+push\s+-f\s+.*\s+(main|master)'; then
  echo "BLOCKED: force push to main/master. This rewrites shared history." >&2
  exit 2
fi

# Hard reset on main
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard' && git branch --show-current 2>/dev/null | grep -qE '^(main|master)$'; then
  echo "BLOCKED: git reset --hard on main/master. Switch to a feature branch first." >&2
  exit 2
fi

# SQL drops
if echo "$COMMAND" | grep -qiE '(DROP\s+TABLE|DROP\s+DATABASE)'; then
  echo "BLOCKED: DROP TABLE/DATABASE detected. Use a migration instead." >&2
  exit 2
fi

# chmod 777
if echo "$COMMAND" | grep -qE 'chmod\s+777'; then
  echo "BLOCKED: chmod 777 makes files world-writable. Use a more restrictive permission." >&2
  exit 2
fi

# npm publish (should go through CI)
if echo "$COMMAND" | grep -qE 'npm\s+publish'; then
  echo "BLOCKED: npm publish should go through CI, not run manually." >&2
  exit 2
fi

# If none matched, allow the command.
exit 0
