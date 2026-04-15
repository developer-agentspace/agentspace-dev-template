# Postmortem: [One-line description of the incident]

> **This is a template.** Copy it to `docs/postmortems/YYYY-MM-DD-short-name.md` (create the directory if needed) and fill in every section. Delete this header.
>
> **Postmortems are blameless.** Focus on the systems and processes that allowed the incident, not on the individuals involved. If you find yourself writing "X should have known better," rephrase as "the system did not give X enough information to make a different decision." That is the actual problem to fix.

## Metadata

- **Severity:** SEV1 / SEV2 / SEV3
- **Date:** YYYY-MM-DD
- **Duration:** HH:MM (from first impact to resolution)
- **Incident commander:** [name]
- **Investigators:** [names]
- **Authors of this document:** [names]
- **Status:** draft / in review / final

## Summary

Two or three sentences. What broke, who was affected, how long it lasted, how it was fixed. Imagine someone reading only the summary — they should still understand the incident.

Example: *"On 2026-04-08, between 14:23 and 15:11 IST, the shipping bill search returned 500 errors for all users. The cause was a missing index on the `shipping_bills.created_at` column after a migration. Resolved by adding the index. Approximately 230 users impacted, no data loss."*

## Impact

Be specific. Numbers, not adjectives.

- **Users affected:** [count or "all users", or "users on plan X"]
- **Duration of impact:** [HH:MM]
- **Geographic scope:** [global / region / specific tenant]
- **Data loss:** [yes / no — and if yes, how much and what]
- **Revenue impact:** [if known and meaningful]
- **Customer-visible:** [yes / no — were complaints filed?]

## Timeline

Use the live timeline kept in the incident channel. Cleaned up but **not** edited to make anyone look better. Honest timestamps.

| Time (IST) | Event |
|---|---|
| 14:23 | Alert fired (Sentry: `BillSearch.tsx:42 ReferenceError`) |
| 14:25 | On-call (Akshat) acknowledged |
| 14:27 | Severity assessed as SEV2 |
| 14:30 | Incident channel opened, IC assigned |
| 14:35 | Identified that the issue started 5 min after the 14:18 deploy |
| 14:38 | Decision: roll back the deploy |
| 14:42 | Rollback complete; verified errors stopped |
| 14:45 | Status page updated to "investigating" |
| 14:51 | Status page updated to "monitoring" |
| 15:11 | Incident declared resolved after 20-minute clean window |

## Root cause analysis

What actually caused the incident? Walk through the chain.

**5 Whys** is a useful structure, but don't stop at the first technical answer. Push to the underlying systemic cause.

Example:

1. **Why did search return 500?** Because the database query timed out.
2. **Why did the query time out?** Because there was no index on `shipping_bills.created_at`.
3. **Why was there no index?** Because the migration that added the column didn't add the index.
4. **Why didn't the migration add the index?** Because the developer wasn't aware that this column would be used as a query filter.
5. **Why wasn't this caught in review?** Because the migration PR and the search PR were reviewed independently, and no reviewer was looking at the connection between them.

The root cause here is **not** "the developer forgot the index." The root cause is **"the review process doesn't catch missing indexes when query filters and migrations are split across PRs."** That's the thing to fix.

## Contributing factors

Things that didn't directly cause the incident but made it worse or harder to detect.

- The error rate alert threshold was set too high; the spike took 4 minutes to fire
- The monitoring dashboard didn't show DB query latency on the main view
- The on-call playbook didn't include "check recent migrations" as a common cause
- ...

## What went well

This section is non-negotiable. Every postmortem includes it. The point is to identify the things you want to keep doing — celebrate them publicly so they become habit.

- Alert fired within 4 minutes of impact
- IC was assigned within 7 minutes of the alert
- Rollback decision was made fast and was the right call
- Communication on the status page was timely and clear
- Total time to mitigation: 15 minutes (well within SLA)

## What went wrong

Process, tooling, and system failures only. Not individual mistakes.

- The migration review didn't surface the missing index
- The error rate alert took 4 minutes to fire (too high a threshold)
- The communicator role wasn't assigned, so customer comms came late
- We didn't have a runbook for "what to check when search times out"

## Action items

Concrete, owned, dated. No action items without all three.

| # | Action | Owner | Due | Ticket |
|---|---|---|---|---|
| 1 | Add `created_at` index to `shipping_bills` table | Chinmay | 2026-04-12 | #88 |
| 2 | Lower error rate alert threshold from 5% to 2% | Akshat | 2026-04-15 | #89 |
| 3 | Add migration review checklist item: "any new column used as a query filter must have an index" | Chinmay | 2026-04-18 | #90 |
| 4 | Add a "check recent migrations" step to the incident response runbook for DB-related incidents | Akshat | 2026-04-15 | #91 |
| 5 | Add DB query latency to the main monitoring dashboard | Chinmay | 2026-04-30 | #92 |

Vague action items are worthless. **"Improve testing"** is not an action item. **"Add a Cypress test for the search page filter happy path by 2026-04-20, owned by Tanay, ticket #93"** is.

## Lessons learned

Generalizable lessons that go beyond the specific incident.

- "Review process needs to span related PRs, not just review them in isolation."
- "Alert thresholds should be set based on user impact, not on internal noise tolerance."
- "Every new column should be evaluated as 'will this be used in a WHERE clause' as part of migration review."

These lessons should make their way into the relevant skill files, not just live in this postmortem. If a lesson is worth learning, it's worth codifying.

## Sign-off

- [ ] Postmortem reviewed by IC
- [ ] Postmortem reviewed by tech lead
- [ ] Action items have tickets
- [ ] Action items have owners and due dates
- [ ] Lessons learned have been added to the relevant skill files where applicable
- [ ] Postmortem published to the team

---

## Appendix: blameless writing tips

The phrase to internalize: **"Person X did Y" → "The system allowed Y to happen because Z"**.

| Blameful (don't write) | Blameless (write this instead) |
|---|---|
| "Akshat forgot to add the index." | "The migration review process did not surface the missing index." |
| "Tanay should have caught this in review." | "Two PRs that depend on each other were reviewed independently, with no mechanism to surface the dependency." |
| "The on-call should have noticed sooner." | "The alert threshold was set too high; the alert fired 4 minutes after impact." |
| "We need to be more careful." | "We need a checklist that catches this category of bug at review time." |

The goal is not to make people feel good. The goal is to make the **system** better. A blameful postmortem teaches people to hide mistakes; a blameless one teaches the team to surface and fix them.
