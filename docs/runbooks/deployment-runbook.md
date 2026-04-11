# Deployment Runbook

> **Owner:** On-call engineer (rotation tracked in team calendar)
> **Pairs with:** [`skills/deployment.md`](../../skills/deployment.md) — the *patterns*. This runbook is the *procedure*.
> **Estimated duration:** 25–45 minutes for a normal deploy. Add 15 minutes if rollback is needed.

This runbook is the canonical procedure for deploying any project cloned from `agentspace-dev-template` to production. **Read it once before your first deploy.** Then use it as a checklist every time.

If something in this runbook is wrong or missing, fix it after the deploy and open a PR. Runbooks are written in advance, but they only get accurate when people use them and find the gaps.

## When to use this runbook

Use this runbook when:

- A PR has been merged to `main` and needs to ship to production
- A hotfix needs to ship out of band
- A scheduled release is being cut

**Do NOT use this runbook for:**

- Local development (`npm run dev`)
- Staging deploys (those are auto-triggered by merges to `develop`, no human action required)
- Database migrations without a paired code deploy (those have their own runbook — TBD, see ticket on incident runbook)

## Pre-flight checklist

**Run through every item.** If any item is `[ ]` and you can't tick it, **stop and ask the team** before continuing. The cost of pausing for 5 minutes is much smaller than the cost of a bad deploy.

- [ ] **CI is green on `main`** — `https://github.com/<org>/<repo>/actions?query=branch:main`
- [ ] **The PR being deployed is merged**, not just approved
- [ ] **You have read the PR description** and understand what's changing
- [ ] **Tests passed locally** on `main` after pulling latest: `npm test && npm run build`
- [ ] **Database migrations are reviewed and idempotent** (if applicable) — see migration runbook
- [ ] **Feature flags for any half-built features are set to OFF in production env**
- [ ] **Secrets and env vars are present** in the production environment (verify via `[hosting provider] dashboard`)
- [ ] **No active incident is in progress** (check the incident channel)
- [ ] **It is not Friday after 14:00 IST** unless this is a hotfix — Friday-evening deploys are banned by team policy
- [ ] **Comms sent**: post a message in the `#deploys` channel with: ticket link, PR link, your name, expected duration
- [ ] **Rollback plan is clear in your head** — see the Rollback section below before you start

## Deploy steps

### Step 1 — Pin the deploy target (1 min)

Tag the commit you're shipping. This is your rollback anchor.

```bash
git checkout main
git pull origin main
git rev-parse HEAD
# Copy the SHA — you will need it for verification and rollback
```

Note the short SHA (first 7 characters) somewhere visible. From here on it's the *deploy SHA*.

### Step 2 — Verify the build artifact (3 min)

Run a clean build locally to confirm the SHA compiles cleanly. Production builds occasionally fail when local builds (which use cached state) don't.

```bash
cd frontend
rm -rf node_modules dist
npm ci
npm run build
```

**Verify:**
- Build exits with code 0
- `dist/` directory exists
- `dist/index.html` references hashed JS/CSS bundles
- No warnings about missing env vars

If anything is off, **STOP**. Open a follow-up ticket and let the team know in `#deploys`.

### Step 3 — Trigger the production deploy (5 min)

[FILL_PER_PROJECT — replace with the actual deploy command for your project]

```bash
# Example for Vercel:
# vercel --prod --confirm
#
# Example for AWS S3 + CloudFront:
# aws s3 sync dist/ s3://[BUCKET_NAME]/ --delete
# aws cloudfront create-invalidation --distribution-id [DIST_ID] --paths "/*"
#
# Example for GitHub Actions production workflow:
# gh workflow run production-deploy.yml --ref main
```

**Verify the deploy started:**
- Check the deploy provider's dashboard for an in-progress build
- Note the build ID — paste it into `#deploys`

### Step 4 — Wait for deploy completion (5–15 min)

Watch the build logs in real time. Don't multitask. If the build fails partway through, you need to know immediately.

**If the build succeeds:** Move on to Step 5.

**If the build fails mid-way:**
- Capture the error
- Post to `#deploys` immediately
- Go to **Rollback — Build failure** below

## Verification (the most important part)

The deploy is **not done** until verification passes. Resist the urge to declare victory the moment the build is green.

### Step 5 — Smoke test the deployed app (5 min)

Open the production URL in an incognito window (no cached state).

- [ ] **Page loads** without console errors
- [ ] **The deploy SHA is visible** in the page footer or via the version endpoint (if your project exposes one)
- [ ] **Auth works** — log in with a test account
- [ ] **At least one read endpoint returns data** — open the main dashboard, confirm KPIs render
- [ ] **At least one write endpoint succeeds** — perform a non-destructive write (e.g., apply a filter, save a preference)
- [ ] **No 4xx/5xx in the network tab** during the smoke test

### Step 6 — Watch error rates and key metrics (10 min)

Open the observability dashboard and watch for 10 minutes after Step 5 finishes.

**Watch:**
- **Error rate** — should remain at or below the pre-deploy baseline. A spike of more than 2× baseline is a rollback trigger.
- **p95 latency on the main API endpoints** — should not jump by more than 50%.
- **Sentry / error tracker** — no new error types appearing
- **5xx count** — no sustained 5xx responses

**If any of these go red, go to Rollback — Post-deploy regression.**

### Step 7 — Mark the deploy complete (1 min)

Once Step 6 is clean for 10 full minutes:

- Post in `#deploys`: *"Deploy of `<deploy-SHA>` complete and verified. No regressions in 10-minute window."*
- Update the deploy log (if your team keeps one)
- You're done.

## Decision tree: succeeded vs failed

```
Did Step 4 (build) succeed?
├── No  → Rollback — Build failure
└── Yes → Did Step 5 (smoke test) pass?
          ├── No  → Rollback — Smoke test failure
          └── Yes → Did Step 6 (10-minute watch) stay clean?
                    ├── No  → Rollback — Post-deploy regression
                    └── Yes → Done. Mark complete in #deploys.
```

## Rollback procedure

The rollback path you take depends on **where** the deploy failed.

### Rollback — Build failure (deploy never went live)

**Easy case.** The previous version is still serving traffic. No user impact.

1. Cancel the failed build in the deploy provider dashboard
2. Post to `#deploys`: *"Deploy of `<deploy-SHA>` failed at build step. Production unchanged. Investigating."*
3. Capture the build log
4. Open a ticket with the failure details
5. Do NOT retry until the root cause is understood

### Rollback — Smoke test failure (deploy went live, app is broken)

**Time-sensitive.** Users are seeing the broken version. Move fast.

1. Identify the **previous good deploy SHA** — find it in the deploy provider's history
2. Re-deploy that SHA immediately:

```bash
# [FILL_PER_PROJECT — exact rollback command for your hosting provider]
# Example for Vercel: navigate to deploys page → click "Promote to Production" on previous build
# Example for S3+CloudFront: re-upload from the previous git tag and invalidate
```

3. **Verify rollback** — re-run Step 5 against the rolled-back app. Confirm the broken behaviour is gone.
4. Post to `#deploys`: *"Rolled back from `<bad-SHA>` to `<good-SHA>`. Production is healthy. Investigating root cause."*
5. **Open a P0 incident ticket** with the failure details
6. Do not attempt a re-deploy until the root cause is documented in the incident

### Rollback — Post-deploy regression (deploy went live, error rates spiked)

Same procedure as the smoke test failure rollback. The only difference is **how** you found the regression (metrics vs manual test).

**Important:** If the regression is caused by a database migration that ran during the deploy, **you cannot just roll back the code**. The migration is forward-only by default. Stop, page Chinmay, and follow the migration recovery runbook (TBD).

### Point of no return

Some deploys cross a point-of-no-return where rollback is no longer safe — typically when an irreversible database migration has run and new writes are using the new schema. **If you suspect you're past PNR, do not roll back.** Stop, page Chinmay, and proceed under their direction.

## Known issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails with `Error: Cannot find module` | Lock file out of sync | `rm -rf node_modules package-lock.json && npm install` locally, commit, redeploy |
| Smoke test 401s on every endpoint | Auth env var not set in prod | Check secret manager, set the missing var, restart the deploy |
| App loads but charts are empty | API base URL points at staging | Check `VITE_API_BASE_URL` in production env vars |
| 5xx spike right after deploy | Database connection pool exhausted | Check DB max connections — may need to scale before retrying |
| `Mixed Content` errors in console | App served over HTTPS but calling `http://` API | Update API base URL to `https://` |
| White screen, no errors | Service worker cached old `index.html` | Hard refresh; if persistent, deploy a cache-busting fix |

Add to this table whenever you hit something new during a deploy.

## Escalation

Page in this order. Do not skip levels unless the higher level is unreachable.

1. **First responder:** the on-call engineer (you, probably). Try to fix the issue using this runbook.
2. **Tech lead:** Chinmay — for backend, infra, or database issues.
3. **Frontend lead:** Tanay — for UI regressions, build chain issues, or design-system problems.
4. **PM:** for any user-facing communication or status page updates.

**Escalation channels:**

- `#deploys` (Slack) — first stop for real-time coordination
- Direct DM if `#deploys` is quiet and the issue is critical
- Phone call if DMs aren't being read and impact is ongoing

Never resolve an outage silently. Even if you fix it in 30 seconds, post the fix in `#deploys` so the team has a record.

## Post-deploy checklist

Once the deploy is complete and verified:

- [ ] `#deploys` notified of success
- [ ] Deploy SHA recorded somewhere durable
- [ ] If anything in this runbook was wrong or missing, open a PR to fix it
- [ ] If this was a hotfix, update the incident ticket with the fix SHA
- [ ] Take a sip of water, you earned it

## Project-specific configuration

[FILL_PER_PROJECT — fill these in once and they apply to every deploy of this project]

| Field | Value |
|---|---|
| Production URL | [e.g., https://app.example.com] |
| Hosting provider | [e.g., Vercel, AWS, Azure] |
| Build artifact location | [e.g., `frontend/dist/`] |
| Deploy command | [exact command] |
| Rollback command | [exact command] |
| Observability dashboard | [URL] |
| Error tracker | [Sentry project URL] |
| On-call rotation | [link to schedule] |
| Status page | [URL, if any] |

## Cross-references

- **Skill file:** [`../../skills/deployment.md`](../../skills/deployment.md) — patterns, Dockerfile templates, CI structure
- **Runbooks index:** [`./README.md`](./README.md)
- **Incident response runbook:** TBD (ticket #44)
- **Dependency upgrades:** [`../dependency-upgrades.md`](../dependency-upgrades.md)
- **Google SRE Book — Release Engineering:** https://sre.google/sre-book/release-engineering/
