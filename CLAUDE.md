# CLAUDE.md — Master Instructions for Claude Code

<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: Fill this when starting a new project
     ========================================================== -->

## 1. Project Context

- **Project Name:** [PROJECT_NAME]
- **Description:** [PROJECT_DESCRIPTION]
- **Client:** [CLIENT_NAME]
- **Figma Link:** [FIGMA_DESIGN_URL]
- **Backend Base URL:** [API_BASE_URL]

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->

## Skills Reference

This project has task-specific skill files in `/skills/` and `.claude/skills/`. When working on a specific area, read the relevant skill file:

- **Frontend work:** `/skills/frontend.md` (React, TypeScript, Tailwind patterns)
- **API work:** `/skills/api.md` (fetch client, React Query, error handling)
- **Testing:** `/skills/testing.md` (React Testing Library, MSW, coverage)
- **Database:** `/skills/database.md` (PostgreSQL conventions, schema patterns)
- **Deployment:** `/skills/deployment.md` (Docker, CI/CD, env vars)

## 2. Tech Stack

- **Frontend:** React 19, TypeScript (strict mode), Tailwind CSS v4
- **State Management:** React Query (server state), React Context + useState (UI state)
- **Routing:** React Router v7
- **Testing:** React Testing Library + Vitest
- **Build Tool:** Vite
- **Backend:** Power Apps REST API (or project-specific backend)
- **Database:** PostgreSQL
- **CI/CD:** GitHub Actions
- **Code Quality:** SonarQube
- **Version Control:** Git + GitHub

<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: Stack overrides
     ========================================================== -->

### Project-Specific Stack Overrides

[FILL_PER_PROJECT — List any deviations from the default stack here. If none, delete this section.]

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->

## 3. Coding Standards

### Naming Conventions
- **Variables and functions:** camelCase (`getUserData`, `isLoading`)
- **Components:** PascalCase (`DashboardPage`, `StatCard`)
- **Files:** PascalCase for components (`StatCard.tsx`), camelCase for utilities (`formatCurrency.ts`)
- **Types/Interfaces:** PascalCase with descriptive names (`ShippingBillResponse`, `DateRangeParams`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **CSS classes:** Tailwind utility classes only — no custom CSS unless absolutely necessary

### TypeScript Rules
- Strict mode enabled — no exceptions
- No `any` type — use `unknown` if the type is truly unknown, then narrow it
- All function parameters and return types must be explicitly typed
- Use `interface` for object shapes, `type` for unions and intersections
- Export types from `/frontend/src/types/` — colocate with related code only when internal

### Component Rules
- Functional components only — no class components
- One component per file
- Props interface defined above the component in the same file
- Use named exports, not default exports
- Destructure props in the function signature
- Keep components under 150 lines — extract sub-components if larger

### Import Order
1. React and third-party libraries
2. Internal components
3. Hooks
4. Utils and helpers
5. Types
6. Styles / Tailwind (if any custom)

Separate each group with a blank line.

## 4. Folder Structure

```
/frontend/src/
├── /components/      # Reusable UI components (Button.tsx, Button.test.tsx colocated)
├── /pages/           # Page-level components (one per route)
├── /lib/             # API client, utility functions, feature flags, logger, analytics
│   └── api.ts        # Single source of truth for all API calls
├── /hooks/           # Custom React hooks
├── /types/           # TypeScript type definitions
│   └── index.ts      # Barrel export
├── /constants/       # App-wide constants
├── /utils/           # Pure utility functions (formatting, validation)
├── /test/            # Test setup files (setup.ts, MSW handlers)
├── App.tsx           # Root component — BrowserRouter + Routes
└── main.tsx          # Entry point — renders App
```

```
/e2e/                 # Playwright E2E tests (separate from unit tests)
```

- **Unit tests are colocated:** `Button.tsx` and `Button.test.tsx` in the same folder. No separate `/tests/` directory for unit tests.
- **E2E tests live in `/e2e/`** at the repo root, not inside `src/`.
- **Test setup** (vitest globals, jest-dom matchers) lives in `src/test/setup.ts`.
- No deeply nested folders — max 3 levels deep.

## 5. Git and Commit Rules

- **Commit after every Claude Code prompt.** This is version control insurance.
- **Branch naming:** `feature/short-description`, `fix/short-description`, `chore/short-description`
- **Commit messages:** Present tense, imperative mood. Example: "Add date range filter component"
- **Never push directly to `main`.** All changes go through PRs.
- **One GitHub issue = one branch = one PR.** Don't bundle unrelated changes.
- **PR title matches the ticket title.**

## 6. What NOT to Do

- **No Axios.** Security risk (supply chain compromise). Use native `fetch` wrapped in `/lib/api.ts`.
- **No Redux, Zustand, or MobX.** React Query + Context is sufficient for our use cases.
- **No hardcoded URLs.** All URLs come from environment variables via `import.meta.env`.
- **No `.env` files committed.** Use `.env.example` with placeholder values. Add `.env*` to `.gitignore`.
- **No inline styles.** Use Tailwind classes exclusively.
- **No `console.log` in production code.** Remove before PR or use a proper logger.
- **No `any` type in TypeScript.** Use `unknown` and narrow with type guards if the type is truly unknown.
- **No unused imports or variables.** ESLint will catch these. Fix them, do not suppress.
- **No magic numbers or strings.** Extract to named constants in `/constants/`.
- **No direct DOM manipulation.** Use React refs if you must interact with DOM.
- **No `useEffect` for data fetching.** That is React Query's job.
- **No class components.** Functional components with hooks only.
- **No copy-pasting API URLs into components.** All API calls go through `/lib/api.ts`.
- **No skipping the self-review step.** Claude must review its own output before PR creation.
- **No merging without CI passing.** SonarQube, lint, type check, tests, and build must all pass.

## 7. Testing Requirements

- Test cases are mandatory for all components and utility functions.
- Minimum coverage threshold: 80%.
- Use React Testing Library. Test user-visible behavior, not implementation details.
- Use MSW (Mock Service Worker) for API mocking. Never mock `fetch` directly.
- Test file naming: `ComponentName.test.tsx` or `utilName.test.ts`
- Colocate tests with source: `StatCard.tsx` and `StatCard.test.tsx` in the same directory.
- Every data-fetching component must have tests for: loading state, error state, success state, empty state.
- Run `npm test` before committing. All tests must pass.
- Run `npm run test:coverage` before creating a PR.
- See `skills/testing.md` for detailed patterns and examples.

## 8. API Integration Rules

- All API calls go through `/lib/api.ts` — no direct `fetch` calls in components.
- Use environment variables for base URLs: `import.meta.env.VITE_API_BASE_URL`
- Handle errors consistently: try/catch with typed error responses.
- Use React Query for all data fetching in components.
- Authentication: Bearer token in Authorization header (when applicable).

<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: API endpoints
     ========================================================== -->

### Project Endpoints

[FILL_PER_PROJECT — List all API endpoints here using the format:]

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET    | /api/example | Description | — | `ExampleResponse` |

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->

## 9. Review and Quality Rules

1. **Self-review:** After finishing a task, prompt Claude to review its own code against this file and the relevant skill files. Fix all issues found.
2. **SonarQube:** Code must pass the quality gate before PR can be merged.
3. **Human review:** Every PR requires at least one approved review by someone other than the author. Reviewers follow the playbook in [`skills/code-review.md`](skills/code-review.md) — what to check, how to give feedback, blocker vs nit conventions, and when to escalate to a domain owner (Chinmay for auth/infra, Tanay for design system, Akshat for accessibility).
4. **No merge without approval.** No exceptions. Self-merge is forbidden even for tiny changes.
5. **PR checklist:**
   - [ ] Tests pass locally
   - [ ] Coverage >= 80%
   - [ ] Lint passes (`npm run lint`)
   - [ ] Type check passes (`npx tsc --noEmit`)
   - [ ] Build succeeds (`npm run build`)
   - [ ] Self-review completed
