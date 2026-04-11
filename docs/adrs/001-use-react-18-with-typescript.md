# 001 — Use React 18 with TypeScript (strict mode)

- **Status:** accepted
- **Date:** 2026-04-08
- **Deciders:** Tanay, Chinmay

## Context

Every project we build at Agent Space is a customer-facing dashboard or internal tool with rich interactivity (filters, charts, tables, forms). We needed to pick a single frontend stack so that the dev template, the team's skills, and Claude Code's instructions could all converge on one set of patterns. Having one stack means cross-project review, shared components, and onboarding are all cheaper.

The team has prior production experience with React and Vue. Tanay has shipped React apps for the last four years; Chinmay's Power Apps work also leans on JavaScript/TypeScript. No one on the team has Svelte or Solid experience.

## Options considered

### Option A — React 18 + TypeScript (strict)
- **Pros:** Largest ecosystem; strongest hiring pool in India; TypeScript catches whole classes of bugs at compile time; React 18 concurrent rendering helps with the chart-heavy dashboards we build; matches the team's existing skill set.
- **Cons:** Larger bundle than Svelte/Solid; React 19 was on the horizon (now released and adopted in newer template versions); strict mode discipline takes effort to maintain.

### Option B — Vue 3 + TypeScript
- **Pros:** Single-file components are arguably cleaner; smaller learning curve for new devs; good TS support since Vue 3.
- **Cons:** Smaller ecosystem in our specific niche (admin dashboards); fewer ready-made charting libraries with Vue bindings; team's React experience would be wasted; harder to find Vue devs in India.

### Option C — Svelte + TypeScript
- **Pros:** Smallest bundle; best DX for greenfield projects; compile-time reactivity is elegant.
- **Cons:** Ecosystem is thin for enterprise dashboards; no team experience; higher hiring risk; charting libraries are immature; Claude Code has weaker training data on Svelte than React.

### Option D — Plain JavaScript (no TypeScript)
- **Pros:** Lower barrier; no build complexity for types.
- **Cons:** Customer dashboards have data shape rules that *must* be enforced; without types, bugs ship to production. Ruled out at the outset.

## Decision

We chose **Option A — React 18 + TypeScript with strict mode**.

The deciding factors were team skill alignment (React experience compounds across projects), ecosystem maturity (Recharts, React Query, React Hook Form, React Testing Library, MSW are all best-in-class), and the fact that Claude Code performs measurably better on React+TS than on alternatives. Strict mode is non-negotiable — half the value of TypeScript disappears without it.

## Consequences

### What becomes easier
- Cross-project component reuse (KPICard, DataTable, ChartCard live in the template)
- Hiring — large pool of React+TS engineers
- Refactors are safer because the type checker catches breakage early
- Claude Code generates better code on first try

### What becomes harder
- Bundle size requires active management (code splitting, lazy loading)
- Strict mode requires discipline; `any` is forbidden by `CLAUDE.md` Section 6
- React 18 → 19 migration will eventually need its own ADR

### What we'll need to revisit
- If a project specifically needs SSR-first or sub-100KB bundles, React may not be the right fit and we'd reopen this decision.
- React 19 adoption will trigger a successor ADR.

## References

- CLAUDE.md Section 2 (Tech Stack)
- skills/frontend.md
- React 18 release notes: https://react.dev/blog/2022/03/29/react-v18
