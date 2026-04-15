# Code Review Skill — Reviewer Playbook

## Purpose
This skill is the reviewer-side counterpart to `git-workflow.md` (which is for PR authors). It exists so that every PR on every Agent Space project gets reviewed the same way, with the same criteria, without depending on which human happens to be on the rotation that week.

The self-review prompt at `templates/self-review-prompt.md` is the **author's** Stage A check. This document is the **reviewer's** Stage B. They are intentionally complementary, not redundant.

## Review goals — what we optimize for

When you review a PR, you are NOT trying to:

- Prove you're smart
- Rewrite the author's code in your head
- Impose your preferred style
- Make every PR perfect

You ARE trying to:

1. **Catch bugs** that the author missed.
2. **Catch regressions** — security, performance, accessibility.
3. **Catch convention drift** — does this match how the rest of the codebase looks?
4. **Improve the code's readability for future devs** (you in 6 months counts).
5. **Spread knowledge** — every PR is a chance for two people to learn the area.

The metric for a good review is: *did this PR ship sooner and with fewer regressions because I reviewed it?* Not how many comments you left.

## Response time expectation

**1 business day for the first review.** Faster is better but not at the expense of other work.

If you can't get to a PR within a day, **say so in the channel** so the author can find another reviewer. Silent reviewer queues are a productivity killer. We'd rather have an honest "I can't get to it today, ask someone else" than a four-day silence.

For urgent fixes (production bug, security patch), reviewers should respond within **2 hours** during business hours. The author should label the PR `urgent` and post in the team channel.

## Review checklist — what to check on every PR

This is the canonical list. Walk through it for every PR. The PR template has a shorter version of this checklist that the author should have already self-checked.

### 1. Correctness — does it do what the ticket says?

- [ ] Read the linked GitHub issue first. Understand the goal before reading the diff.
- [ ] Does the PR implement what the ticket asked for?
- [ ] Does the PR do **only** what the ticket asked for? (Bundling unrelated changes is a `blocker`.)
- [ ] Are edge cases handled? Empty data, very long strings, zero values, null, undefined, network errors.

### 2. Tests

- [ ] Are there tests for the new code?
- [ ] Do the tests test **behaviour**, not implementation details? (Don't test internal state variables; test what the user sees.)
- [ ] Are loading / error / empty / success states covered for any data-fetching component?
- [ ] Coverage stayed above 80% (CI will report this).
- [ ] Did the author actually run the tests locally? (CI will tell you, but glance.)

### 3. Readability

- [ ] Could a new dev who joined yesterday understand this code without asking?
- [ ] Are variable and function names clear and accurate?
- [ ] Are non-obvious decisions explained in a comment? (Note: only non-obvious ones — over-commenting is its own smell.)
- [ ] Is the function or component small enough? (Components > 150 lines per `CLAUDE.md` are a smell.)

### 4. Consistency

- [ ] Does this match the existing patterns in the codebase?
- [ ] Is it using the project's standard libraries? (React Query for fetch, the logger for logs, the flags helpers for feature flags, etc.)
- [ ] If it deviates, is there an ADR or a written reason?

### 5. Security — see `skills/security.md` for the full list

- [ ] No hardcoded secrets, tokens, or API keys
- [ ] No new `dangerouslySetInnerHTML` without DOMPurify
- [ ] User input that ends up in URLs is sanitized
- [ ] No PII in logs, errors, or analytics events
- [ ] If the PR touches auth or sessions, did Chinmay review it?

### 6. Performance

- [ ] No obvious render-loop hazards (state updates inside render, expensive work in render without `useMemo`)
- [ ] Bundle size: any new dependency added? Is it justified?
- [ ] Lazy loading for any new route?
- [ ] No premature optimization either — `useMemo` everywhere is its own problem.

### 7. Accessibility — see `skills/accessibility.md` for the full list

- [ ] Every interactive element is keyboard reachable
- [ ] Every form input has a `<label>`
- [ ] Every image has `alt`
- [ ] No `<div onClick>` — use `<button>` or `<a>`
- [ ] Color isn't the only signal for state
- [ ] If new ARIA was added, was it necessary?

### 8. Documentation

- [ ] If the PR is non-trivial, does it update the relevant skill file or doc?
- [ ] If the PR is an architectural decision, is there an ADR (`docs/adrs/`)?
- [ ] If the PR adds a new env var, is `.env.example` updated?
- [ ] If the PR adds a new operational procedure, is there a runbook?

## How to give feedback

**Always prefix comments** so the author knows whether to act:

| Prefix | Meaning | Author action |
|---|---|---|
| `blocker:` | Must be fixed before merge. Real bug, security issue, missing test, broken UI, type error, accessibility regression, scope creep. | Fix it. Re-request review when done. |
| `suggestion:` | The reviewer would do it differently. Discussable. | Discuss in thread. Author decides. Not blocking. |
| `question:` | The reviewer is genuinely confused, not making a point. | Answer the question. May or may not require a code change. |
| `nit:` | Minor style or naming issue. Reviewer's opinion. | Fix if cheap. Ignore if not. Not blocking. |
| `praise:` | Something the reviewer wants to highlight as good. | Smile. Take note for future PRs. |

If a comment has no prefix, **treat it as `suggestion:`**. Reviewers should never expect authors to guess.

### Examples — good feedback

```
blocker: This call writes the user's email to the analytics event,
which violates the PII rules in skills/security.md. Use the userId
instead, or hash the email if you specifically need a per-email
unique key.
```

```
suggestion: This works, but we have a `formatCurrency` helper in
`utils/formatCurrency.ts` that handles the Indian-locale comma
grouping. Up to you whether to switch — the inline version is fine
too.
```

```
question: Why are we catching the error and then re-throwing it
without modification on line 47? Is there a transform happening I'm
not seeing, or can we drop the try/catch?
```

```
nit: `data` → `bills` would make this a bit more self-documenting.
```

```
praise: Nice catch on the empty state — the prior version would
have shown a confusing empty table. Good DX improvement.
```

### Examples — bad feedback

```
This is wrong.                          # ← prefix? what's wrong? what to do?
You should rewrite this.                # ← rewrite to what? prescribe, don't proscribe.
[diff with reviewer's whole rewrite]    # ← if it's a small change, just say what to change. if it's big, the PR isn't ready.
Why did you do this???                  # ← multiple question marks read as hostile. one is fine.
This is bad. We don't do it this way.   # ← cite the convention. point at the file.
[no comment, just changes-requested]    # ← what do you want changed?
```

## What NOT to do as a reviewer

- **Don't rewrite the author's code in comments.** If the rewrite is small, describe the change in one sentence and let the author make it. If the rewrite is large, the PR isn't ready and needs a conversation, not a code dump.
- **Don't demand changes without explaining why.** "Don't do it this way" is not feedback; "Don't do it this way because X" is.
- **Don't approve without reading.** Rubber-stamp reviews are worse than no reviews — they create false confidence.
- **Don't review a PR you can't focus on.** Wait an hour. The author would rather have a thoughtful review later than a distracted review now.
- **Don't bikeshed.** Spending 40 comments on variable names while ignoring a missing test is the wrong call. Spend reviewer attention on the things that matter most.
- **Don't treat reviews as combat.** If you find yourself getting irritated, walk away and come back. The goal is shipping good code, not winning.
- **Don't bring style preferences as `blocker:`.** Style is a `nit:` at most. Use the linter for style enforcement, not human reviewers.

## What NOT to do as a PR author (when receiving a review)

These are the mirror image — included here so authors and reviewers share expectations.

- Don't take feedback personally. The reviewer is critiquing the code, not you.
- Don't argue every comment. Pick the ones that matter; concede the rest.
- Don't merge with unaddressed `blocker:` comments. If you disagree, discuss until you reach consensus.
- Don't ignore `nit:` comments silently — either fix them or reply "good call, leaving for follow-up" so the reviewer knows you saw it.
- Don't ghost a review. If you need to defer, say so.

## Approval rules

- **At least one approving review is required** before merge. (CLAUDE.md Section 9.)
- **Reviewer is not the same person as the author.** Self-merge with no review is forbidden — even for tiny changes.
- **Sensitive areas need a domain owner's approval:**
  - Auth or session code → Chinmay
  - CI/CD or infra → Chinmay
  - Design system / shared components → Tanay
  - Accessibility-critical changes → Akshat
- **Dependabot PRs** follow the rules in `docs/dependency-upgrades.md`, not this skill.

## When the review uncovers a bigger problem

Sometimes reviewing a PR reveals that the underlying approach is wrong. This is uncomfortable for everyone but worth addressing directly:

1. **Don't request changes that try to bandaid the wrong approach.** That just defers the pain.
2. **Pause the PR.** Open a thread: "I think this needs a different approach. Can we talk for 15 minutes before continuing?"
3. **Have the conversation.** Voice or in-person if possible. Long async threads are bad for this.
4. **Update the ticket** with the new approach, then close the existing PR and open a new one.

This is rare. But when it happens, the right thing is to spend the half-hour now rather than half a day later.

## Cross-references

- `skills/git-workflow.md` — author-side conventions (branches, commits, PRs)
- `templates/self-review-prompt.md` — Claude self-review (Stage A)
- `skills/security.md` — security checklist
- `skills/accessibility.md` — accessibility checklist
- `skills/testing.md` — what tests should look like
- `CLAUDE.md` Section 9 — Review and Quality Rules
- `.github/pull_request_template.md` — author + reviewer checklists
- Google's engineering practices on code review — https://google.github.io/eng-practices/review/
