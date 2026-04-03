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

### Error Handling
- Every data-fetching component must handle: loading, error, and empty states.
- Use error boundaries for unexpected runtime errors.
- Display user-friendly error messages — never show raw error objects.
- Provide retry mechanisms for failed API calls (React Query handles this by default).

### File Organization
- One component per file.
- Colocate component + test: `StatCard.tsx` and `StatCard.test.tsx` in the same folder.
- Shared components go in `/components/`. Page-specific sub-components can live in `/pages/PageName/`.
- Custom hooks go in `/hooks/`. Name them `useXxx`.

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
