# 002 — Tailwind CSS over custom CSS files

- **Status:** accepted
- **Date:** 2026-04-08
- **Deciders:** Tanay, Chinmay

## Context

Every project we ship has the same frontend problem: a designer (Tanay) hands over an HTML/Figma mockup, and a developer (or Claude) needs to translate it into reusable components without spending half the budget on CSS plumbing. Custom CSS at past gigs led to bloated stylesheets, naming conflicts, dead rules nobody could safely delete, and `!important` wars during the final QA crunch.

We needed a styling approach that:

1. Lets a developer match a Figma design without inventing a class hierarchy
2. Stays in the JSX/TSX file so reviewers can see styling and structure together
3. Doesn't allow specificity to grow over time
4. Works well with Claude Code's pattern-matching strengths

## Options considered

### Option A — Tailwind CSS (utility-first)
- **Pros:** No naming required; co-located with markup; PurgeCSS removes unused utilities so production CSS stays small; design tokens (colors, spacing, fonts) live in one config; Claude Code has very strong training data; easy to enforce consistency by listing allowed classes.
- **Cons:** Long `className` strings can hurt readability for complex components; learning curve for devs who haven't seen utility-first; designer–developer handoff still requires translation from Figma values to Tailwind tokens.

### Option B — CSS Modules
- **Pros:** Real CSS, no new syntax; class names are scoped automatically; works with any CSS preprocessor.
- **Cons:** Still requires inventing names for every visual variant; styling lives in a separate file from the component, so reviewers context-switch; design token enforcement is manual.

### Option C — CSS-in-JS (styled-components, Emotion)
- **Pros:** Co-located with components; full power of JS for dynamic styles; theme support is first-class.
- **Cons:** Runtime cost (bundle + parse + style injection); React Server Components story is messy; team has had pain with this in past projects; the React team itself has discouraged it for new code.

### Option D — Plain CSS files with BEM or similar
- **Pros:** Familiar to everyone; no build chain.
- **Cons:** Naming discipline always slips; dead code accumulates; the exact pattern we wanted to escape.

## Decision

We chose **Option A — Tailwind CSS**.

Co-location with JSX (developer can see structure + styling in one file) and the absence of naming overhead were the deciding factors. The "long className strings" concern is real but mitigated by extracting components when a class string starts to feel oppressive — that's the right pressure release valve. Tailwind's PurgeCSS keeps shipped CSS small, and the team has standardized on `tailwind-merge` + `clsx` for conditional classes.

## Consequences

### What becomes easier
- Pixel-matching a Figma design without inventing classes
- Code review (everything is in the component file)
- Removing dead styles (deleting a component deletes its styles)
- Enforcing the design system (the `tailwind.config.js` / `@theme` block is the single source of truth for colors, spacing, fonts)

### What becomes harder
- Onboarding a developer who has never used Tailwind
- Reading components with very long `className` strings — extract sub-components when this happens
- Switching design systems mid-project (a token rename touches many files)

### What we'll need to revisit
- If we adopt React Server Components heavily, we may need to revisit the styling approach (Tailwind v4 already handles this well so this is unlikely).
- If a client requires shipping a specific design system that's already coded against another solution (e.g., MUI), we'd write a per-project ADR overriding this one.

## References

- ADR 001 — Use React 18 with TypeScript
- CLAUDE.md Section 6 (no inline styles)
- skills/frontend.md (Tailwind CSS Rules section)
- Tailwind v4 release notes: https://tailwindcss.com/blog/tailwindcss-v4
