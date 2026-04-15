# Git Workflow Skill — Branches, Commits, and PRs

## Purpose
This is the canonical git workflow for every Agent Space project. Follow it whether you're a human dev or Claude Code. The goal is a git history that is **searchable, bisectable, and reviewable** — so that "what changed in November" or "which commit broke this" is a 10-second answer, not a half-hour spelunk.

`CLAUDE.md` Section 5 has the one-paragraph version. This document has the full rules and examples.

## Branching strategy

**We use trunk-based development with short-lived feature branches.** One ticket = one branch = one PR. No long-lived `develop` or `release` branches. `main` is always shippable.

### Branch naming

Format: `{type}/{issue-number}-{short-kebab-description}`

Allowed types:

| Type | Use for |
|---|---|
| `feature/` | New functionality (new component, new endpoint, new page) |
| `fix/` | Bug fix (something is broken, you make it work) |
| `docs/` | Documentation only — no code changes |
| `refactor/` | Restructure code without changing behaviour |
| `chore/` | Tooling, config, dependencies, build system |
| `test/` | Adding or fixing tests only |

The `{issue-number}` is the GitHub issue number this branch addresses. Every branch must trace to a ticket.

The `{short-kebab-description}` is 3–6 kebab-cased words. Long enough to be meaningful, short enough to fit in a tab.

**Examples:**

- `feature/24-date-range-filter`
- `fix/89-search-button-not-clickable`
- `docs/45-add-adr-template`
- `refactor/102-extract-kpi-card`
- `chore/46-set-up-dependabot`
- `test/61-cover-error-states`

**Never:**

- `feature/new-stuff` (no issue number)
- `feature/tanay/sidebar` (don't include people's names)
- `Feature/Date-Range-Filter` (no PascalCase, no spaces)
- `wip` (be specific)

### When to create a branch

- **One issue = one branch.** Don't bundle unrelated changes. If you discover a second bug while fixing the first, open a second issue and a second branch.
- **Branch off `main`**, always. Pull latest first: `git checkout main && git pull origin main && git checkout -b feature/24-...`.
- **Don't reuse branches.** If a PR is merged, delete the branch. Start fresh for the next ticket.

## Commit messages

We follow a **simplified Conventional Commits** format. Strict enough to be parseable by tooling, loose enough not to slow you down.

### Format

```
{type}({scope}): {subject}

{body — optional but encouraged for non-trivial changes}

{footer — optional, used for breaking changes and issue refs}
```

- **Subject line:** 72 characters max, present tense imperative ("add", not "added"), no trailing period.
- **Blank line** between subject and body.
- **Body:** wrapped at 72 characters, explains the *why* not the *what* (the diff shows the what).
- **Footer:** `Closes #24`, `Refs #89`, or `BREAKING CHANGE: ...` for breaking changes.

### Allowed types

| Type | Use for |
|---|---|
| `feat` | A new user-facing feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Code style only (formatting, missing semicolons) — never user-visible |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or fixing tests |
| `chore` | Build, deps, tooling, config |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |

### Scope

Optional but useful when the project is large. Common scopes: `api`, `auth`, `dashboard`, `search`, `reports`. Pick a noun from the codebase, not a verb.

### Examples — good

```
feat(search): add date range filter to shipping bills

The previous search treated all dates equally, which made it
impossible to scope queries to a quarter or fiscal year. The new
filter wires the existing PageHeader DateRangeFilter into the search
query state and re-runs the search on change.

Closes #24
```

```
fix(auth): clear React Query cache on logout

Stale data from a previous user was leaking into the next session
because the cache survived the route change. Now we call
queryClient.clear() in the logout handler before navigating.

Closes #89
```

```
docs(adrs): record decision to use Tailwind over custom CSS

Closes #45
```

```
refactor(kpi-card): extract trend pill into its own component

The KPICard render was getting unwieldy and the trend pill is reused
in two other places. No behavioural change.
```

```
chore(deps): bump react-query from 5.96 to 5.98 (patch group)
```

### Examples — bad

```
update stuff                            # ← what stuff? when? why?
fixed bug                               # ← which bug?
WIP                                     # ← never commit a WIP message to main
Added the new date filter and also     # ← two changes, two commits
fixed the auth bug
asdfasdf                                # ← obvious
Search.tsx                              # ← that's a file, not a message
```

### Commit cadence

- **Commit early, commit often.** Small commits are easier to review, revert, and bisect.
- **Each commit should be a self-contained logical unit.** If you can't describe a commit in one sentence, it's doing too much.
- **Commit after every Claude Code prompt.** This is version-control insurance — see `CLAUDE.md` Section 5.

## Pull requests

### PR title

The PR title should match the format of the most important commit in the branch:

```
feat(search): add date range filter to shipping bills
```

Or, if it matches the ticket title exactly (often the case for one-commit PRs), use the ticket title:

```
3.2 — Add date range filter component
```

Pick one convention per project and stick with it. The dev template uses ticket titles for PRs because they map directly to issues.

### PR body

Use the template at `.github/pull_request_template.md`. The required fields:

1. **Summary** — 1–3 bullet points of what the PR does
2. **Related issue** — `Closes #24` so GitHub auto-closes on merge
3. **Test plan** — what you tested and how
4. **Screenshots** — for any UI change, before and after

The two example PR bodies below show the two ends of the spectrum.

### Example — small change PR body

```markdown
## Summary
- Replaces the placeholder date picker with the shared DateRangeFilter component.
- No behavioural change — just unblocks ticket #28 which depends on the shared component.

## Related issue
Refs #24

## Test plan
- [x] `npm test` green
- [x] Manual: opened the search page, picked a range, confirmed the filter chip updates
- [x] Build green

## Screenshots
| Before | After |
|---|---|
| ![before](...) | ![after](...) |
```

### Example — large feature PR body

```markdown
## Summary
- Adds a new "Reports" page with 6 report cards, a filter panel, and a preview table.
- Lifts filter state into the page so the Generate button can apply filters atomically.
- Adds 8 new mock data shapes for the report tables (CHA, country summary, ops, freight, GST, sales).
- Wires up vitest config and the first 22 unit tests for the new components.

## Related issue
Closes #18 (Reports page)
Closes #19 (vitest setup)

## Architecture notes
- Filter state lives in `ReportsPage` rather than `FilterPanel` so the Generate button can apply filters atomically. `FilterPanel` is now a controlled component.
- The 6 report cards are config-driven from a `reports: ReportDef[]` array — adding a 7th report is one entry plus one column config plus one stats block.
- Mock data is in `frontend/src/lib/mockData.ts`. When Mansi's API is ready, swap the imports for React Query hooks. The page components should not need to change.

## What's deferred
- Real CSV / Excel export — currently the buttons are visual only. Tracked in #28.
- Coverage of the FilterPanel's preset buttons (only date input behaviour is tested). Tracked in #31.

## Test plan
- [x] `npm test` → 22 passing
- [x] `npm run build` → green
- [x] `npm run lint` → green
- [x] Manual: clicked each report card, applied each filter combination, confirmed the table filters as expected
- [x] Verified the Generated HH:MM:SS badge appears after clicking Generate

## Screenshots
[before / after for each of the 6 report cards]
```

### What blocks a PR vs what's a nit

The reviewer playbook lives in [`code-review.md`](./code-review.md). Quick summary for PR authors:

- **Blocker:** failing tests, lint errors, missing tests for new code, security issues, broken UI, type errors, accessibility regressions
- **Suggestion:** the reviewer would do it differently — discuss and decide, not blocking
- **Nit:** style, naming, micro-optimization — fix if cheap, ignore if not

If a reviewer leaves a comment without a `blocker:` / `suggestion:` / `question:` / `nit:` prefix, treat it as `suggestion:`.

## Merge strategy

**Squash merge** for every PR. One PR = one commit on `main`.

Why squash:

- `main` history stays linear and readable — one line per feature, not 47 fixup commits
- Bisecting is straightforward
- Reverting a feature is one `git revert <sha>`
- The PR body becomes the squashed commit body, so context is preserved

The branch's individual commits live on the PR forever in GitHub's UI for anyone who wants the granular history.

**Never:**

- Merge commits on `main` (no `Merge pull request #...` clutter)
- Force-push to `main`
- Direct push to `main` (the branch protection rule should make this physically impossible)
- Rebase merge (squash is cleaner)

## Tags and releases

Tags follow **semver**: `v1.2.3`.

- **MAJOR (`v2.0.0`)** — breaking API changes (rare for an internal SPA, but possible if we publish a shared component library)
- **MINOR (`v1.3.0`)** — new features, backwards compatible
- **PATCH (`v1.2.4`)** — bug fixes only, no new features

Tag from `main` only:

```bash
git checkout main
git pull origin main
git tag -a v1.2.3 -m "Release v1.2.3 — see CHANGELOG.md"
git push origin v1.2.3
```

Tag triggers (CI release workflow, deploy automation) are configured in `.github/workflows/`.

## Setting up your local git config

Run these once per machine when you join an Agent Space project. Replace the placeholders.

```bash
# Identity — match your GitHub email
git config --global user.name "Your Name"
git config --global user.email "you@agentspace.ai"

# Editor for commit messages
git config --global core.editor "code --wait"   # VS Code
# git config --global core.editor "nano"        # or nano

# Use the project commit message template
git config --local commit.template .gitmessage

# Pull = fetch + rebase, never merge
git config --global pull.rebase true

# Auto-prune deleted remote branches on fetch
git config --global fetch.prune true

# Helpful aliases
git config --global alias.s "status -sb"
git config --global alias.l "log --oneline --graph --decorate -20"
git config --global alias.last "log -1 HEAD"
```

The `commit.template` line points your local git at `.gitmessage` in the repo root, which is a structured template that pre-fills the commit subject format. Set this once after cloning.

## Cross-references

- `CLAUDE.md` Section 5 — the one-paragraph summary of these rules
- `.github/pull_request_template.md` — the PR body template
- `.gitmessage` — the commit message template (set via `git config --local commit.template .gitmessage`)
- `skills/code-review.md` — the reviewer-side playbook
- `docs/runbooks/deployment-runbook.md` — what happens after the merge
- Conventional Commits — https://www.conventionalcommits.org
