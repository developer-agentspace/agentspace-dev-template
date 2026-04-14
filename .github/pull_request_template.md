## Summary

[1-3 bullet points describing what this PR does]

## Related Issue

Closes #[issue number]

## AI Disclosure

<!-- Required: disclose whether AI was used and for what -->
- [ ] This code was **fully AI-generated** (Claude Code)
- [ ] This code was **partially AI-assisted** — AI wrote [describe scope], human wrote [describe scope]
- [ ] This code was **fully human-written**

## Test plan

- [ ] `npm test` green
- [ ] `npm run lint` green
- [ ] `npm run build` green
- [ ] [Describe specific manual testing performed]

## Author checklist

- [ ] Branch and commit follow `skills/git-workflow.md` conventions
- [ ] Tests cover the new code (>= 80% coverage)
- [ ] 3-pass self-review completed (`/review`)
- [ ] No `console.log` — use `logger` from `frontend/src/lib/logger.ts`
- [ ] No hardcoded URLs or secrets (see `skills/security.md`)
- [ ] No `any` types
- [ ] No PII in logs, errors, analytics, or Sentry
- [ ] Docs / ADRs updated if the change is non-trivial

## Reviewer

<!-- Name the specific person reviewing this PR -->
**Assigned reviewer:** @[github-username]

## Rollback plan

<!-- What happens if this breaks production after merge? -->
- [ ] **Revert is safe** — `git revert <sha>` with no data migration concerns
- [ ] **Revert needs care** — [explain why, e.g., database migration, external API change]
- [ ] **Feature flag** — can be turned off via `setFlagOverride('flag-name', false)` without redeploy

## Screenshots

[For any UI change, include before/after screenshots]

---

> **Dependabot PRs** follow `docs/dependency-upgrades.md` instead of this checklist. CI must still be green.
