# Multi-Terminal Parallel Workflow Guide

## Concept

Instead of running one Claude Code session doing one thing at a time, you open 4 terminal tabs simultaneously, each running its own Claude Code session, each working on a different part of the product. All sessions share the same `.claude/` config and skills, so consistency is automatic.

This gives you approximately 4x productivity. Each terminal works on different files, so there are no merge conflicts.

## When to Use

Use parallel terminals when:
- A feature has multiple independent parts (component, API, tests, docs)
- You need to research while building
- You want one terminal reviewing while another builds

Use a single terminal when:
- The task is small and self-contained
- All changes are in the same file
- You need sequential steps that depend on each other

## Setup Steps

### Option A: iTerm2 (Mac)
1. Open iTerm2
2. Cmd+D to split vertically, Cmd+Shift+D to split horizontally
3. Create a 2x2 grid (4 panes)
4. In each pane: `cd /path/to/project && claude`

### Option B: VS Code Terminals
1. Open VS Code in the project
2. Click the + button in the terminal panel 4 times
3. In each terminal: `claude`

### Option C: Windows Terminal
1. Open Windows Terminal
2. Alt+Shift+D to split panes
3. Create 4 panes
4. In each: `cd C:\path\to\project` then `claude`

## Task Splitting Strategy

**Golden rule: each terminal works on different files.**

### Good Split

| Terminal | Task | Files |
|---|---|---|
| 1 | Build the UI component | `src/components/ExportButton.tsx` |
| 2 | Write the API integration | `src/lib/api.ts` (new function only) |
| 3 | Write tests | `src/components/ExportButton.test.tsx` |
| 4 | Review existing code, write docs | Read-only, no file changes |

### Bad Split

Two terminals editing `src/components/SearchBar.tsx` at the same time. This causes merge conflicts and wasted work.

## Real Project Example: "Add Export to CSV"

### Terminal 1: Component
```
Build an ExportButton component that shows a dropdown with format options (CSV, Excel, PDF).
Put it in src/components/ExportButton.tsx. Use Tailwind for styling.
Follow the frontend.md skill rules.
```

### Terminal 2: API
```
Add a new API function called exportData in src/lib/api.ts.
It should call GET /api/export with query params: format, dateRange, filters.
Follow the api.md skill rules. Return typed response.
```

### Terminal 3: Tests
```
Write unit tests for the ExportButton component in src/components/ExportButton.test.tsx.
Test: renders correctly, dropdown opens on click, calls onExport when format selected.
Follow the testing.md skill rules.
```

### Terminal 4: Research
```
Read the current search results page at src/pages/SearchResults.tsx.
Tell me where the ExportButton should be placed and what props it needs
based on the existing data flow.
```

## Commit Workflow

1. Commit frequently from each terminal (after every Claude prompt)
2. Each terminal commits to the same branch
3. Since they edit different files, there are no conflicts
4. If a conflict does happen: `git stash`, `git pull`, `git stash pop`, resolve manually

## Key Rules

1. **Plan the split before opening terminals.** Decide which terminal does what.
2. **Each terminal edits different files.** No exceptions.
3. **Commit after every Claude prompt.** From every terminal.
4. **One branch for the whole feature.** All terminals work on the same branch.
5. **Terminal 4 is always read-only.** Use it for review, research, or docs.
