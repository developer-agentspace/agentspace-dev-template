# Runbooks

This directory contains **operational runbooks** — step-by-step procedures the team follows during real, time-sensitive operations: deploys, incidents, rollbacks, recovery from outages.

## Runbooks vs skill files vs ADRs

The team has three different documentation surfaces, and they answer different questions. Knowing which one to read (or write) saves a lot of confusion:

| Surface | Question it answers | When you read it | Tone |
|---|---|---|---|
| **`skills/`** | *How do I write code that follows our patterns?* | While coding, before a PR | Conceptual, with examples |
| **`docs/adrs/`** | *Why does the project look the way it does?* | Onboarding, before refactoring | Historical, explains tradeoffs |
| **`docs/runbooks/`** (you are here) | *What do I do, right now, in this exact situation?* | During a deploy, an incident, an outage | Imperative, copy-pasteable |

A skill file might say *"use multi-stage Docker builds"*. The deployment runbook tells you *"step 3: run `docker build --target=production -t app:$(git rev-parse --short HEAD) .`"*. Different question, different answer.

## When to write a runbook

Write a runbook when:

- The procedure is **operational** (you run it, not write it)
- The procedure is **time-sensitive** (someone needs it at 2am, half-asleep)
- The procedure has **decision points** ("if X, do Y; if Z, escalate")
- The procedure has **rollback or recovery** steps
- The cost of a mistake is high (production deploys, schema migrations, incident response)

If a procedure is run rarely and casually (quarterly dependency upgrade review, etc.), a doc in `docs/` is enough. Reserve runbooks for the things you'd want a printed copy of when the network is down.

## Runbook standards

Every runbook in this directory follows the same shape so a half-asleep engineer can find what they need:

1. **Owner** — which team or rotation maintains it
2. **When to use this runbook** — concrete trigger conditions
3. **Pre-conditions / pre-flight checklist** — what must be true before you start
4. **Steps** — numbered, copy-pasteable, with timing estimates
5. **Verification** — how you know each step worked
6. **Rollback** — how to undo, with a clear point-of-no-return marker if there is one
7. **Known issues** — common failures and their fixes
8. **Escalation** — who to page if you're stuck

Write runbooks in the second person (*"You will run..."*), present tense, and assume the reader is in a hurry. Cut every word that isn't load-bearing.

## Current runbooks

| File | Purpose | Owner |
|---|---|---|
| [`deployment-runbook.md`](./deployment-runbook.md) | Production deploys (any project cloned from this template) | On-call engineer |

## Cross-references

- **Skill files:** [`../../skills/`](../../skills/) — patterns and conventions
- **ADRs:** [`../adrs/`](../adrs/) — historical decisions
- **CLAUDE.md:** [`../../CLAUDE.md`](../../CLAUDE.md) — master instructions for Claude Code
- **Google SRE Book — Writing Runbooks:** https://sre.google/sre-book/being-on-call/
