#!/usr/bin/env bash
# PostToolUse hook — auto-lints files after Edit or Write.
#
# Registered in .claude/settings.json under hooks.PostToolUse.
# Runs after every successful Edit or Write tool call.
# Exit code is informational only (doesn't block the tool).
#
# What this does:
#   - Detects the file that was just edited/written
#   - If it's a .ts/.tsx/.js/.jsx file, runs ESLint --fix on it
#   - Reports any remaining unfixable issues so Claude can address them

set -euo pipefail

INPUT=$(cat)

# Extract file_path from the tool input JSON.
FILE=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"[^"]*"' | head -1 | sed 's/"file_path"\s*:\s*"//;s/"$//' 2>/dev/null || echo "")

if [ -z "$FILE" ]; then
  exit 0
fi

# Only lint JS/TS files.
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx)
    # Find the nearest directory containing an eslint config.
    DIR=$(dirname "$FILE")
    while [ "$DIR" != "/" ] && [ "$DIR" != "." ]; do
      if [ -f "$DIR/eslint.config.js" ] || [ -f "$DIR/.eslintrc.js" ] || [ -f "$DIR/.eslintrc.json" ]; then
        cd "$DIR"
        npx eslint --fix "$FILE" 2>&1 || true
        exit 0
      fi
      DIR=$(dirname "$DIR")
    done
    ;;
esac

exit 0
