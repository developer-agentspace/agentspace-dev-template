# Weekly Audit Process

> **Owner:** Rotating (currently Akshat)
> **When:** Every Friday, 30 minutes
> **Purpose:** Catch quality drift before it compounds. The template has 9+ quality gates on every PR, but gates only work if they're maintained.

## Why a weekly audit

Individual PRs are reviewed, but trends slip through:
- Coverage creeps from 85% to 78% over 10 PRs, each individually "close enough"
- A flag that was supposed to expire 3 months ago is still in the codebase
- Dependabot PRs pile up because nobody owns the Monday review
- The deploy runbook references a server that was decommissioned 2 weeks ago
- An ADR is superseded but nobody wrote the replacement

The weekly audit is 30 minutes of *"is the system still healthy?"* — not a line-by-line code review.

## The checklist

### 1. Test coverage (5 min)

```bash
cd frontend && npm run test:coverage
```

- [ ] Coverage is at or above **80%** for statements, branches, functions, lines
- [ ] If below, open a ticket tagged `test-debt` for the specific files/functions that dropped
- [ ] No test files were deleted without replacement in the last week's PRs

### 2. Dependency health (5 min)

```bash
cd frontend && npm audit
```

- [ ] No **high** or **critical** CVEs. If any exist, escalate immediately — don't wait for Dependabot.
- [ ] Check the [Dependabot PR queue](https://github.com/developer-agentspace/agentspace-dev-template/pulls?q=is:pr+is:open+label:dependencies). Are there PRs older than 7 days? If yes, review them now or assign someone.
- [ ] No new dependency was added this week without justification in its PR description.

### 3. Feature flag hygiene (3 min)

Open `frontend/src/lib/flags-config.ts`:

- [ ] Every flag has an `expiresOn` date
- [ ] Any flag past its expiry gets one of: removed (if fully rolled out or abandoned), or re-justified with a new expiry
- [ ] No flag has been at 100% rollout for more than 2 weeks without being cleaned up

### 4. Runbook and doc freshness (5 min)

- [ ] `docs/runbooks/deployment-runbook.md` — do the deploy commands still match reality? (Spot-check one command.)
- [ ] `docs/runbooks/incident-response.md` — are the escalation contacts still correct?
- [ ] `docs/environments.md` — does the variable catalog match what's actually in `.env.example`?
- [ ] Were any ADRs written this week? If a significant decision was made without one, open a ticket.

### 5. CI health (5 min)

- [ ] Open the [Actions tab](https://github.com/developer-agentspace/agentspace-dev-template/actions). Are there failing workflows on `main`? If yes, that's a P0 — fix today.
- [ ] Is the Lighthouse CI workflow still running? Check the last successful run date.
- [ ] Is SonarQube reporting? Check the last scan.

### 6. Security spot-check (5 min)

```bash
# If gitleaks is installed:
gitleaks git --since="7 days ago" --config .gitleaks.toml
```

- [ ] No secrets committed in the last week's PRs
- [ ] `.env.example` doesn't contain real values (grep for anything that looks like a real token)
- [ ] No new `dangerouslySetInnerHTML` added without DOMPurify (grep the diff)

### 7. PR queue hygiene (2 min)

- [ ] Any open PRs older than 3 business days? Ping the reviewer.
- [ ] Any PRs with unresolved `blocker:` comments? They shouldn't be sitting.

## After the audit

- Post a one-line summary in the team channel: *"Friday audit: all green"* or *"Friday audit: [N] items flagged — tickets opened: #X, #Y"*
- If any items are flagged, open tickets immediately. Don't "remember to do it Monday."
- The audit is done when the checklist is complete and any flagged items have tickets.

## What this is NOT

- **Not a code review.** PRs have their own review process.
- **Not a performance review of people.** This checks the *system*, not individuals.
- **Not optional when things are busy.** Especially not then. That's when drift happens fastest.

## Cross-references

- `skills/security.md` — the full security policy the audit checks against
- `skills/code-review.md` — the per-PR review playbook
- `docs/dependency-upgrades.md` — the Dependabot policy
- `docs/environments.md` — the env var catalog
- `frontend/src/lib/flags-config.ts` — the feature flag registry
