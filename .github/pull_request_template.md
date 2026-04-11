## Summary

[1-3 bullet points describing what this PR does]

## Related Issue

Closes #[issue number]

## Test plan

[Bulleted markdown checklist of how this PR was tested. Be specific. "Manually tested" is not enough.]

- [ ] `npm test` green
- [ ] `npm run lint` green
- [ ] `npm run build` green
- [ ] [feature-specific manual verification]

## Author checklist

- [ ] Branch and commit follow the format in `skills/git-workflow.md`
- [ ] Tests cover the new code (≥ 80% coverage)
- [ ] Claude self-review completed
- [ ] No `console.log` — use `logger` from `frontend/src/lib/logger.ts`
- [ ] No hardcoded URLs or secrets (see `skills/security.md`)
- [ ] No `any` types
- [ ] Docs / ADRs updated if the change is non-trivial

## Reviewer checklist

[For the reviewer to tick — see `skills/code-review.md` when it exists for the full playbook.]

- [ ] Tests cover the new code, including edge cases
- [ ] No hardcoded secrets, tokens, or API keys
- [ ] Accessible: keyboard navigation works, semantic HTML, color contrast OK
- [ ] Matches existing patterns and conventions
- [ ] No obvious performance regressions
- [ ] Security checklist from `skills/security.md` passes

## Screenshots

[For any UI change, include before/after screenshots.]

---

> **Note for Dependabot PRs:** Dependabot opens its own auto-generated PRs with grouped changelogs. The reviewer follows the rules in [`docs/dependency-upgrades.md`](../docs/dependency-upgrades.md) instead of this checklist. CI must still be green before merging.
