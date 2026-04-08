#!/bin/bash
# Re-inject critical rules after context compaction
# Prevents Claude from "forgetting" project rules after long sessions

echo "⚠️ Context was compacted. Re-reading critical rules:"
echo ""
echo "REMINDERS AFTER COMPACTION:"
echo "1. All coding standards are in CLAUDE.md — read it if unsure"
echo "2. All API calls go through /lib/api.ts — never call fetch directly in components"
echo "3. No Axios — use native fetch only"
echo "4. No any types in TypeScript"
echo "5. Commit after every prompt"
echo "6. Run /review before creating a PR"
echo "7. Tests are mandatory — 80% coverage minimum"
echo "8. Skills are in /skills/ and .claude/skills/ — read the relevant one before working"
echo ""

if [ -f "CLAUDE.md" ]; then
  echo "CLAUDE.md found. Re-read it now for full rules."
fi
