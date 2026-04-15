# Dependency Upgrade Playbook

This document is the source of truth for how the team handles dependency updates in any repo cloned from `agentspace-dev-template`. Pair this with `.github/dependabot.yml` (the config) and `skills/security.md` (the vulnerability response policy).

## Why we automate this

Dependencies rot. CVEs get filed against versions we ship. If we don't pay down upgrade debt continuously, we end up doing dangerous big-bang upgrades under deadline pressure, usually right after a security disclosure. Dependabot automates the boring weekly part so the only decisions left for humans are the ones that need judgment.

## What Dependabot does for us

`.github/dependabot.yml` configures three update streams:

1. **Root npm** — test runners, e2e tooling, anything in the top-level `package.json`.
2. **Frontend npm** — the React app under `/frontend`.
3. **GitHub Actions** — pinned action versions in `.github/workflows/*.yml`.

All three:

- Run **weekly on Monday at 06:00 IST** so PRs are waiting when the team starts the week.
- **Group minor + patch updates** by dependency type (production vs development) to cut PR noise.
- **Ignore major version bumps** — those require manual evaluation and an ADR (see below).
- **Auto-label** PRs with `dependencies` (and `frontend` / `ci` where relevant).
- **Auto-assign** to the rotating reviewer (currently Akshat — change in `dependabot.yml` if it rotates).
- **Cap open PRs** at 10 per ecosystem so the queue can't explode.

Security updates run **out of band** — Dependabot ignores the schedule for them and opens PRs immediately when a CVE is published against a dependency we use. These bypass the major-version ignore rule too.

## Weekly review process

**Owner:** Akshat (rotating, see `.github/dependabot.yml` `assignees`)
**When:** Every Monday afternoon, 30 min slot
**SLA:** All non-major Dependabot PRs from that week are merged or have a written reason to defer by Friday EOD.

**Steps for the reviewer:**

1. Open `https://github.com/<org>/<repo>/pulls?q=is:pr+is:open+label:dependencies`.
2. For each grouped PR, check the description (Dependabot lists every package in the group with old → new versions and changelog links).
3. Wait for CI: lint, type check, tests, build, SonarQube must all be green.
4. Apply the rules in the next section.
5. Merge with **squash + delete branch**.
6. If anything is deferred, comment on the PR with the reason and add the `blocked` label.

## Update rules by type

### Patch updates (`x.y.Z` → `x.y.Z+1`)

- **Default:** auto-merge if CI is green.
- **Why:** Patch releases are bug and security fixes. The semver contract says no API changes.
- **Watch out for:** any patch in a package that has a history of breaking semver (lookin' at you, certain webpack plugins). When in doubt, smoke test locally.

### Minor updates (`x.Y.z` → `x.Y+1.0`)

- **Manual review.** Read the changelog. Run the app locally. Click around the affected feature.
- **Smoke test checklist:**
  - `npm run dev` boots without warnings
  - `npm run build` succeeds
  - `npm test` passes
  - The feature touched by the package still works visually (if it's a UI library)
- Merge if all green.

### Major updates (`X.y.z` → `X+1.0.0`)

- **Dependabot does not open these automatically** (we ignore them in the config). They have to be triggered manually.
- **Process:**
  1. Open an Architecture Decision Record (ADR) — see `docs/adr/` (when ticket #45 lands).
  2. Read the migration guide cover to cover.
  3. Create a `chore/upgrade-<package>-vX` branch.
  4. Run the upgrade locally. Fix breakages. Update tests.
  5. Open a PR. Tag Chinmay or Tanay for review.
  6. Merge only after manual QA on a deployed preview.
- **Estimated cost:** Always more than you think. Budget half a day minimum, even for "small" majors.

### Security patches

- **SLA: merged within 48 hours of the PR being opened.**
- **Why:** A security update PR means GitHub knows about a vulnerability in a package we ship. The clock is ticking on disclosure timelines.
- **Process:**
  1. Reviewer is paged via the standard `dependencies` label notification PLUS a security advisory notification.
  2. Drop other Dependabot work, prioritize this PR.
  3. If CI passes, merge same day.
  4. If CI fails because the patched version has a breaking change, escalate to Chinmay immediately — we'll do an emergency major upgrade and push a hotfix.
  5. Document the incident in `docs/incidents/` (when ticket #44 lands).

## Handling breaking changes

Sometimes a "minor" update is technically a breaking change because the maintainer didn't follow semver. Or a security patch only exists in a major version we haven't migrated to yet.

- **When to pin:** if a breaking minor update lands and we genuinely can't fix it this week, pin the package to the last good version in `package.json` (e.g., `"some-pkg": "1.4.2"` instead of `"^1.4.2"`) and open a follow-up ticket. Comment on the Dependabot PR with the ticket link and close it.
- **When to upgrade:** if the breaking change is small (a renamed export, a removed deprecated API), just fix it in the same PR. Don't defer trivial migrations.
- **When to swap:** if a package has gone unmaintained or hostile, this is the trigger to evaluate replacements. Open an ADR.

## Lock file hygiene

- **Never edit `package-lock.json` by hand.** It's generated. Hand-edits get overwritten on the next `npm install` and frequently break the dep tree.
- **Always commit `package-lock.json`.** It's not optional — reproducible builds depend on it.
- **One package change per commit.** When manually upgrading something, run `npm install <pkg>@<version>` and commit only the `package.json` and `package-lock.json` changes for that package. Don't mix multiple package upgrades into one commit.
- **Never run `npm install` with no arguments to "refresh" the lock file.** That can silently bump every transitive dep. If you need to regenerate, delete `node_modules` and `package-lock.json` and reinstall, then carefully review the diff.

## Adding new dependencies

This is the inverse of upgrading and the same rules apply. Before adding any new package:

1. **Justify it.** Is there a stdlib or existing dep that does this? Three lines of inline code is almost always better than a 50KB transitive dep tree.
2. **Check the package on `npmjs.com`.** Last publish date, weekly downloads, open issue count, who maintains it.
3. **Run `npm audit` after install** and fix anything it flags before committing.
4. **Mention the addition in the PR description** — what package, why, what alternative was considered.
5. **Avoid blacklisted packages:** see `CLAUDE.md` Section 6 (no Axios, no Redux, no Zustand, no MobX).

## When Dependabot itself breaks

Sometimes Dependabot opens nonsense PRs (wrong group, dep doesn't exist, etc.). To debug:

1. Check the Dependabot logs: `https://github.com/<org>/<repo>/network/updates`
2. Validate `dependabot.yml` syntax: GitHub will surface errors in the same UI.
3. Common gotchas:
   - `directory:` must point to a folder containing a `package.json`, not the `package.json` itself.
   - Time format must be 24-hour `HH:MM`.
   - Group names can't contain spaces or special characters.
4. Fix `dependabot.yml`, commit, push. Dependabot picks it up within minutes.

## Cross-references

- **Config file:** `.github/dependabot.yml`
- **Security policy:** `skills/security.md` (when ticket #33 lands) — for the vulnerability response flow
- **ADR template:** `docs/adr/` (when ticket #45 lands) — for major upgrades
- **Incident runbook:** `docs/incidents/` (when ticket #44 lands) — for security upgrade incidents
- **GitHub Dependabot docs:** https://docs.github.com/en/code-security/dependabot
