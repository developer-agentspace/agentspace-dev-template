# Incident Response Runbook

> **Owner:** On-call engineer
> **Pairs with:** [`postmortem-template.md`](./postmortem-template.md) (use within 48h of any SEV1 or SEV2)
> **First read:** Now, while nothing is broken. Not at 2am.

This runbook is the canonical first-10-minutes procedure for any production incident on an Agent Space project. It exists so that when something is on fire, you don't have to invent a process — you just follow the steps.

**Print or bookmark this. Don't try to find it during an incident.**

## When to use this runbook

You should be following this runbook the moment any of these is true:

- A user-visible feature is broken in production
- The error rate has spiked above the alerting threshold
- A deploy has caused a regression that wasn't caught by the [deployment runbook](./deployment-runbook.md)
- The status page is showing a green status but reality is showing red
- Customer support is reporting a flood of complaints about the same thing

If you're not sure whether something is an incident, **assume it is** and follow the runbook. The cost of treating a non-incident as an incident is 10 minutes of process. The cost of the reverse is much higher.

## Severity levels

The first decision in any incident is the severity. It determines who you wake up and how fast.

| Level | Definition | Response time | Examples |
|---|---|---|---|
| **SEV1** | Total outage, data loss, or security breach. The product is unusable for most users. | **5 minutes.** Page everyone. | Site is down, database is corrupted, auth is fully broken, secret is leaked |
| **SEV2** | Significant feature is broken. A meaningful subset of users cannot accomplish a meaningful workflow. | **30 minutes.** Page on-call + tech lead. | Search returns no results, exports time out, login is intermittent, key page won't load |
| **SEV3** | Degraded experience. Users can work around it. | **1 business day.** Async ticket. | A chart renders wrong, a non-critical button doesn't work, a metric is slow |

If you're between two levels, **pick the higher one**. You can downgrade. Upgrading mid-incident wastes the most valuable resource (the first 10 minutes).

## First 10 minutes — the checklist

**Walk through every step.** Don't skip ahead.

### 0:00 — 0:30 — Acknowledge

- [ ] Acknowledge the alert (in PagerDuty / Sentry / wherever it came from). This stops the page from re-firing and tells the rest of the team someone is on it.
- [ ] Open the team channel (`#incidents` if it exists, otherwise the main team channel)
- [ ] Post a quick hold message:

```
🚨 Investigating possible incident — alert: <link or summary>. More in 5 min. — <your name>
```

The point of this message is **not** to communicate the problem. It's to tell the team that you've seen the alert and are looking. Without it, three other people will wake up and start investigating in parallel.

### 0:30 — 2:00 — Assess severity

- [ ] What's broken? Be specific. "Login" is too vague. "Login form returns 500 on submit for users on the password flow" is useful.
- [ ] Who is affected? "All users" or "users on plan X" or "one customer in Brazil"?
- [ ] How bad is it? Pick a SEV level using the table above.
- [ ] Are users actively losing data or money? If yes, this is SEV1 regardless of other factors.

### 2:00 — 5:00 — Open the incident

- [ ] Create a thread or new channel for the incident. Pin or link it from the team channel.
- [ ] Start the incident timeline doc. This is the running record of what happened, when, and who did what. The simplest format works:

```
## Incident: <one-line description>
- Severity: SEVx
- Started: 2026-04-11 14:23 IST (when the alert fired)
- Detected: 2026-04-11 14:25 IST (when a human noticed)
- Incident commander: <your name>

### Timeline
14:25 — Alert fired (Sentry: Foo.tsx:42 ReferenceError)
14:26 — IC acknowledged
14:28 — Severity assessed as SEV2
14:31 — ...
```

- [ ] Assign roles (for SEV1 or SEV2):
  - **Incident Commander (IC)** — runs the incident, makes decisions, NOT the same person debugging
  - **Investigator** — actually digs into the code/logs/dashboards
  - **Communicator** — posts updates to the team channel and status page
  - For SEV3, one person can be all three.

### 5:00 — 8:00 — Initial investigation

- [ ] Check Sentry / error tracker for recent error groups. Has anything spiked in the last 30 minutes?
- [ ] Check the [deploy log](./deployment-runbook.md). Was there a deploy in the last hour? **A recent deploy is the most likely cause of any sudden incident.**
- [ ] Check the dependency status: backend API health endpoint, database, CDN, DNS, Sentry itself.
- [ ] Check the Lighthouse / performance dashboard if it's a slowness issue.
- [ ] Reproduce the issue in an incognito browser if possible. Confirm it's not just one user's cache.

**If a recent deploy is the cause, your first instinct should be to roll back.** Investigate later. Rollback procedure is in the [deployment runbook](./deployment-runbook.md). The rule is: **mitigate first, fix later.**

### 8:00 — 10:00 — Communicate

- [ ] Post the first real status update to the team channel. Use this template:

```
🔴 SEVx incident open
What's broken: <one sentence, user-visible>
Impact: <who is affected, how>
Started: <time>
What we know: <2-3 bullets>
What we're doing: <2-3 bullets>
Next update: in 15 minutes (or when the situation changes)
IC: <name>
```

- [ ] If SEV1 or any customer-facing impact: update the status page (if the project has one)
- [ ] If SEV1: alert the PM so they can prepare customer comms

## Investigation steps (after the first 10 minutes)

Now you have a few minutes to think. Work the problem.

### Common investigation paths

**"Errors started 30 minutes ago"**
1. What deployed in the 30 minutes before the errors started?
2. Roll back the deploy. Verify errors stop.
3. Open a ticket for the actual fix.

**"Page is slow"**
1. Check the Lighthouse dashboard
2. Check the backend API latency
3. Check CDN status
4. Check the user's region — could be a regional CDN issue

**"Login is broken"**
1. Check the auth provider's status page
2. Check if the JWT signing key has rotated
3. Check `VITE_API_BASE_URL` is correct in the production env
4. Check CORS errors in the browser console

**"Data is wrong / missing"**
1. **STOP. Do not roll back yet** — a rollback may make data loss worse.
2. Check whether the bad data is being written or just displayed wrong.
3. If being written: page Chinmay immediately. Stop new writes if possible (feature flag the affected flow off).
4. If just displayed wrong: rollback is safe.

**"Sentry is showing errors but users aren't complaining"**
1. Check the error volume vs baseline. A 2× spike from a low base may not be customer-impacting.
2. Check whether the error is in a code path that has a fallback.
3. Don't assume "no complaints = no impact." Some users just leave.

## Communication protocol

### Cadence

- **SEV1:** team channel update **every 15 minutes** until resolved
- **SEV2:** team channel update **every 30 minutes** until resolved
- **SEV3:** post when the issue is identified and again when resolved — no scheduled cadence

Even if there's nothing new to say, post: *"Still investigating. No new info. Next update in 15 min."* Silence makes everyone assume the worst.

### Who to notify by severity

| Level | Initial page | Updates | Resolution |
|---|---|---|---|
| SEV1 | On-call + Tech lead (Chinmay) + PM + Frontend lead (Tanay) | Team channel + DM to PM | Team channel + PM + customer success |
| SEV2 | On-call + Tech lead (Chinmay) | Team channel | Team channel |
| SEV3 | On-call | Team channel | Team channel |

### Customer comms templates

**Status page — initial (SEV1 or SEV2 with customer impact):**

```
We are investigating reports of <one sentence — user-visible problem>.
Some users may experience <impact>. We are working on a fix and will
post another update within 30 minutes.
```

**Status page — update:**

```
Update: We have identified the cause of <issue>. <What's being done.>
We expect resolution within <time>. Next update: <time>.
```

**Status page — resolved:**

```
Resolved: <Issue> has been resolved as of <time>. Affected users may
need to refresh their browser. We will publish a postmortem within 48
hours.
```

Keep customer-facing language **factual, non-defensive, and short**. Don't apologise excessively. Don't blame anyone. Don't promise things you can't deliver.

## Resolution

When you believe the incident is resolved:

1. **Verify the fix works.** Re-run the manual test that caught the original problem. Watch metrics for 10 minutes after the fix lands. **Do not declare resolved until metrics have actually returned to baseline.**
2. **Update the status page** with the resolved message.
3. **Post the resolution to the team channel** with a one-paragraph summary:
   ```
   ✅ SEVx incident resolved at <time>.
   What was broken: <one sentence>
   Root cause: <one sentence — preliminary, full RCA in postmortem>
   How fixed: <one sentence>
   Total duration: <minutes>
   Postmortem: scheduled for <time>
   ```
4. **Schedule the postmortem within 48 hours.** SEV1 and SEV2 always require a postmortem. SEV3 is optional based on the IC's judgment.
5. **Close the incident channel** (or unpin the thread).

## Post-incident

Within 48 hours of any SEV1 or SEV2:

- [ ] Schedule a 30-60 minute postmortem meeting. All on-call participants attend. PM and tech lead attend.
- [ ] Use the [postmortem template](./postmortem-template.md) to structure the discussion and the writeup.
- [ ] **Blameless.** The postmortem is about the system, not the people. If a postmortem is becoming about who screwed up, redirect it.
- [ ] Action items get tickets, owners, and due dates. Action items without owners are wishes, not commitments.
- [ ] Publish the postmortem to the team. Internal-facing for SEV2, customer-facing summary for SEV1 if there was external impact.

## Roles cheat sheet

When you're paged into a SEV1 or SEV2 with multiple people responding:

| Role | Responsibility | What they do NOT do |
|---|---|---|
| **Incident Commander (IC)** | Runs the incident. Makes decisions. Coordinates. Decides when to escalate, when to roll back, when it's resolved. | Debug code. Read logs. Reproduce bugs. The IC's job is to coordinate, not to fix. |
| **Investigator** | Reads logs, reproduces the bug, finds the root cause, writes the fix. | Communicate updates. Decide severity. The investigator should be heads-down, not context-switching. |
| **Communicator** | Posts updates to team channel and status page on the cadence above. Drafts customer comms. | Investigate. Communicate is a full-time role during a SEV1. |

For a SEV3 with one person, all three roles collapse into "you." For a SEV2, IC + Investigator is the minimum split. For a SEV1, all three should be different people.

## What NOT to do during an incident

- **Don't blame.** Even if you're sure who broke it. Blame slows down the response and poisons the postmortem. Time for accountability is *after*, in the postmortem, with system fixes.
- **Don't solo-debug a SEV1.** Two people are 4× as fast, not 2×, because one of them notices the thing the other missed.
- **Don't deploy fixes without verification.** The temptation to ship a "quick fix" is always strong. The quick fix often makes it worse. Verify the fix locally first.
- **Don't skip the postmortem.** "We already know what happened" is exactly when you most need a structured postmortem to find the systemic issues.
- **Don't communicate by DM.** Everything goes in the incident channel so the timeline is preserved. DMs are invisible and forgotten.
- **Don't keep working past your effectiveness.** If you've been on for 4 hours straight, hand off. Tired investigators make mistakes.

## Cross-references

- [`deployment-runbook.md`](./deployment-runbook.md) — covers the rollback procedure that this runbook references
- [`postmortem-template.md`](./postmortem-template.md) — the blameless postmortem template
- `skills/security.md` — if the incident is a security breach, also follow the security incident escalation
- `docs/logging.md` — how to read structured logs from the logger
- Google SRE Book — Incident Management: https://sre.google/sre-book/managing-incidents/
- PagerDuty Incident Response: https://response.pagerduty.com/
