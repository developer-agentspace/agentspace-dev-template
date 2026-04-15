# Architecture Decision Records

This directory holds the **Architecture Decision Records (ADRs)** for projects cloned from the Agent Space dev template. ADRs capture the *why* behind significant technical decisions so future developers (and future-you) don't have to guess or play archaeology with git history.

## What is an ADR?

An ADR is a short markdown document that records:

1. **The context** — what was the problem or pressure that forced a decision?
2. **The options** — what alternatives were considered, and what were their tradeoffs?
3. **The decision** — what we picked and why.
4. **The consequences** — what becomes easier and harder because of the choice.

That's it. ADRs are not design documents, technical specs, or implementation guides. They are a paper trail for decisions, written at the moment of the decision, and never deleted.

The format used here is based on Michael Nygard's original [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) post (2011), with minor adaptations for our process.

## When to write one

**Write an ADR when the decision:**

- Affects the project structure (folder layout, module boundaries, build system)
- Adds, removes, or replaces a major dependency (frameworks, runtimes, databases)
- Locks in a pattern that other code will follow (state management, data fetching, error handling)
- Has a cost that's hard to reverse (database schema, API contracts, auth model)
- Was contested or had a non-obvious tradeoff that future devs will question

**Do NOT write an ADR for:**

- Implementation details inside a single file or function
- Naming choices that don't affect external APIs
- Dependency *upgrades* (those are tracked in PR descriptions; see `docs/dependency-upgrades.md`)
- Trivial choices that can be reversed in a single PR without breaking other code

If you're unsure, the test is: *"In six months, will a new developer ask why we did this?"* If yes, write an ADR. If no, skip it.

## Numbering

ADRs are numbered sequentially starting at `001`. **Numbers are never reused.** If an ADR is superseded, the number stays — the file gets a new status and a link to the replacement.

File naming: `NNN-short-kebab-case-title.md`

Examples:
- `001-use-react-18-with-typescript.md`
- `002-tailwind-over-custom-css.md`
- `015-postgres-jsonb-for-flexible-customer-fields.md`

## Status lifecycle

Every ADR has a `Status` field at the top. The valid values are:

| Status | Meaning |
|---|---|
| `proposed` | Drafted but not yet agreed. Open for comment. |
| `accepted` | Decision is in effect. Code should follow it. |
| `deprecated` | No longer recommended, but no replacement yet. |
| `superseded by NNN` | Replaced by ADR number NNN. The newer ADR explains why. |

Once accepted, **never edit the Context, Options, or Decision sections** — those are the historical record. If the situation changes, write a new ADR that supersedes the old one.

You *may* edit the `Consequences` section to add observations as they emerge ("update 2026-08-01: this caused issue X, mitigated by Y").

## How to write a new ADR

1. Pick the next free number by counting the highest existing file in this directory and adding 1.
2. Copy `000-template.md` to `NNN-your-title.md`.
3. Fill in every section. If a section doesn't apply, write *"N/A — explain why"* rather than leaving it blank.
4. Keep it short. **Target 200–500 words.** ADRs are not essays.
5. Open a PR with the new ADR. Reviewers focus on whether the *decision* is sound, not whether the prose is polished.
6. When merged, the ADR is canon. Code reviewers may cite it in future PRs.

## Reading order for new developers

If you're joining a project mid-way, read every ADR in this directory in numerical order before touching the codebase. They are the shortest path to understanding why the project looks the way it does. After you've read them, ask the team about any decisions that weren't recorded — those are the ones most likely to bite you.

## Cross-references

- **Template:** [`000-template.md`](./000-template.md)
- **Architecture overview:** [`../architecture.md`](../architecture.md) — describes the *current* state, while ADRs describe how we got there.
- **Dependency upgrades:** [`../dependency-upgrades.md`](../dependency-upgrades.md) — major upgrades require an ADR per the playbook.
- **Original ADR post:** [Michael Nygard, 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- **More examples:** [adr.github.io](https://adr.github.io)
