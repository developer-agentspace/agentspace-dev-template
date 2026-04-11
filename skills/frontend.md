# Frontend Skill — React 18 + TypeScript + Tailwind CSS

## Purpose
This skill defines how Claude Code should write frontend code for any Agent Space project. Follow these rules for all React component work.

## Component Architecture

### Component Structure
Every component follows this pattern:

```tsx
// 1. Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { StatCard } from '../components/StatCard';
import { useDateRange } from '../hooks/useDateRange';
import { formatCurrency } from '../utils/formatCurrency';

import type { DashboardStats } from '../types';

// 2. Props interface
interface DashboardPageProps {
  title: string;
  defaultDateRange?: DateRange;
}

// 3. Component
export function DashboardPage({ title, defaultDateRange }: DashboardPageProps) {
  // hooks first
  const [filter, setFilter] = useState('');
  const { data, isLoading, error } = useQuery({ ... });

  // derived values
  const filteredData = data?.filter(item => item.name.includes(filter));

  // early returns for states
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  // render
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      {/* component JSX */}
    </div>
  );
}
```

### State Management
- **Server state:** React Query. Never use useEffect + fetch for data fetching.
- **UI state:** useState for local, React Context for shared UI state (theme, sidebar open/closed).
- **No Redux.** Not needed for our use cases.
- **No prop drilling beyond 2 levels.** Extract to Context or compose with children.

### Tailwind CSS Rules
- Use Tailwind utility classes for all styling.
- No custom CSS files unless Tailwind genuinely cannot handle the case.
- Use the `cn()` utility (clsx + tailwind-merge) for conditional classes.
- Responsive design: mobile-first. Use `sm:`, `md:`, `lg:` breakpoints.
- Spacing: use Tailwind's spacing scale consistently (`p-4`, `gap-6`, `mt-8`).
- Colors: use Tailwind's color palette or project-defined CSS variables. No hardcoded hex values.

### Performance
- Use `React.lazy()` for route-level code splitting.
- Memoize expensive computations with `useMemo`.
- Memoize callback props with `useCallback` only when passing to memoized children.
- Don't over-optimize — premature memoization adds complexity without benefit.
- Images: use lazy loading, provide width/height to prevent layout shift.

### Accessibility
- All interactive elements must be keyboard accessible.
- Use semantic HTML: `<button>` not `<div onClick>`, `<nav>`, `<main>`, `<section>`.
- Images need `alt` text. Decorative images use `alt=""`.
- Form inputs need associated `<label>` elements.
- Color contrast must meet WCAG AA (4.5:1 for text).

### Data Fetching Pattern
Always use React Query. Never use `useEffect` + `fetch`.

```tsx
import { useQuery } from '@tanstack/react-query';
import { getItems } from '../lib/api';

export function ItemList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: getItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message="Failed to load items" onRetry={() => {}} />;
  if (!data?.length) return <EmptyState message="No items found" />;

  return <ul>{data.map(item => <ItemCard key={item.id} item={item} />)}</ul>;
}
```

### Loading, Error, and Empty States
Every data-connected component must handle all three states:

```tsx
// Loading: Show skeleton UI, not a spinner
if (isLoading) return <div className="animate-pulse bg-gray-200 rounded h-40" />;

// Error: User-friendly message with retry
if (error) return (
  <div className="text-center p-6">
    <p className="text-red-500">Something went wrong</p>
    <button onClick={() => refetch()} className="mt-2 text-sm underline">Try again</button>
  </div>
);

// Empty: Helpful message, not a blank page
if (!data?.length) return <p className="text-gray-400 text-center p-6">No results found</p>;
```

### Form Handling
- Use controlled components with `useState` for simple forms.
- Use React Hook Form for complex forms with validation.
- Validate on blur and on submit. Show inline error messages.
- Disable submit button during API calls. Show loading indicator.

### Error Handling
- Every data-fetching component must handle: loading, error, and empty states.
- Use error boundaries for unexpected runtime errors.
- Display user-friendly error messages. Never show raw error objects.
- Provide retry mechanisms for failed API calls (React Query handles this by default).

### File Organization
- One component per file.
- Colocate component + test: `StatCard.tsx` and `StatCard.test.tsx` in the same folder.
- Shared components go in `/components/`. Page-specific sub-components can live in `/pages/PageName/`.
- Custom hooks go in `/hooks/`. Name them `useXxx`.

### Feature Flags

The template ships a lightweight feature flag system split across a few files so each one is single-purpose (and so the React Fast Refresh ESLint rule stays happy):

- `frontend/src/lib/flags-config.ts` — typed registry of flag names, defaults, owners, expiry dates
- `frontend/src/lib/flags.ts` — framework-agnostic helpers (`isEnabled`, `setFlagOverride`, `clearFlagOverride`, `subscribeToFlagChanges`)
- `frontend/src/lib/useFlag.ts` — React hook that re-renders on override changes
- `frontend/src/lib/FeatureFlag.tsx` — wrapper component for conditional rendering

Use it whenever you ship code to production that should not yet be visible to all users — typically WIP features, A/B variants, or anything you want to be able to roll back without a redeploy.

**The three things you actually need:**

```tsx
import { isEnabled } from '../lib/flags';
import { useFlag } from '../lib/useFlag';
import { FeatureFlag } from '../lib/FeatureFlag';

// 1. Sync check — for utilities, event handlers, non-React code
if (isEnabled('example-csv-export')) {
  exportToCsv();
}

// 2. Hook — for components that need to react to flag changes
function Dashboard() {
  const newLayout = useFlag('example-new-dashboard');
  return newLayout ? <NewDashboard /> : <OldDashboard />;
}

// 3. Wrapper component — cleaner than ternaries for large blocks
<FeatureFlag flag="example-csv-export" fallback={null}>
  <ExportCsvButton />
</FeatureFlag>
```

**How to add a new flag:**

1. Add the kebab-case name to the `FLAG_NAMES` tuple in `frontend/src/lib/flags-config.ts`. The TypeScript union ensures every call site is type-checked.
2. Add a matching entry to `FLAG_METADATA` with `description`, `defaultValue`, `owner`, and `expiresOn`. **Every flag must have an expiry date** — flags without one rot into permanent dead code.
3. Add the corresponding `VITE_FLAG_<UPPER_SNAKE>` entry to `frontend/.env.example`.
4. Set the value in your real `.env.local` file (or leave unset to use the default).

**Resolution order** (first match wins): localStorage override → env var → metadata default. The localStorage override is intentionally available in production builds so support engineers can flip a flag for one user session without a redeploy. Set it from the browser console:

```js
localStorage.setItem('flag:example-new-dashboard', 'true');
// or programmatically:
import { setFlagOverride, clearFlagOverride } from './lib/flags';
setFlagOverride('example-new-dashboard', true);
clearFlagOverride('example-new-dashboard');
```

**When to use a flag vs deleting dead code:**

- Use a flag when the new code is **finished but not ready for users yet** (waiting on QA, comms, legal, partner integration).
- Use a flag when a **rollback path** matters (the change is large enough that you want to be able to flip it off without a redeploy).
- **Do NOT use a flag** to keep half-finished code in `main` indefinitely. That's what feature branches are for.
- **Do NOT use a flag** for permanent configuration (per-tenant settings, env-specific URLs). Those go in env vars or per-tenant config.

**Flag deprecation policy:**

When a flag has been at 100% rollout for two weeks, or has been off for two weeks with no plan to enable, **delete the flag and the branch it gates in the same PR**. The `expiresOn` field exists to remind the owner to do this. A flag past its expiry should appear in the weekly review and either get re-justified (with a new expiry) or removed.

<!-- ==========================================================
     PROJECT-SPECIFIC SECTION: Fill this when starting a new project
     ========================================================== -->

## Project-Specific Components

- **Component List:** [FILL_PER_PROJECT]
- **Page List:** [FILL_PER_PROJECT]
- **Design System Link:** [FIGMA_DESIGN_URL]

<!-- ==========================================================
     END OF PROJECT-SPECIFIC SECTION
     ========================================================== -->
