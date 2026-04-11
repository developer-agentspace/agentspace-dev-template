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
- Colocate component + test + story: `Button.tsx`, `Button.test.tsx`, `Button.stories.tsx` in the same folder.
- Shared components go in `/components/`. Page-specific sub-components can live in `/pages/PageName/`.
- Custom hooks go in `/hooks/`. Name them `useXxx`.

### Component Documentation with Storybook

Every reusable primitive (`Button`, `Card`, `Input`, `Modal`, etc.) **must** have at least one Storybook story. Pages and one-off components don't need stories — only the things you'd reuse.

**Why:** stories are how designers, PMs, and other devs see what components exist without spinning up the full app. They also catch a11y issues automatically via the Storybook a11y addon, which runs the same axe checks documented in `skills/accessibility.md`.

**Setup:** the template ships with `.storybook/main.ts` and `.storybook/preview.ts` pre-configured for Vite + Tailwind v4. To activate Storybook in a project:

```bash
cd frontend
npx storybook@latest init   # installs Storybook deps and writes its boilerplate
npm run storybook           # opens at http://localhost:6006
```

The pre-existing `.storybook/main.ts` and `preview.ts` will be used as-is (Storybook init detects they exist and skips overwriting).

**Writing a story:**

```tsx
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
  },
  args: { children: 'Click me' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
```

**Story coverage rules:**

- **Default story** showing the component with sensible default props
- **Variant stories** — one per visual variant (primary, secondary, danger, etc.)
- **State stories** — loading, disabled, error if applicable
- **Composition story** — at least one showing the component in a realistic layout (e.g. inside a Card, in a grid)

The two example stories in the template (`Button.stories.tsx`, `Card.stories.tsx`) demonstrate the pattern. Use them as a starting point.

**The a11y addon runs on every story** and reports violations in the Storybook UI. Treat any reported violation the same way you'd treat a failing test — fix it before merge.

**`npm run build-storybook`** produces a static site under `storybook-static/` that can be deployed to GitHub Pages or Chromatic for design review. `storybook-static/` is gitignored.

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
