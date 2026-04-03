# Testing Skill — Standards and Rules

## Purpose
This skill defines testing standards for all Agent Space projects. Testing rules are 100% fixed — they do not change between projects.

## Testing Library
- **React Testing Library** for component tests.
- **Jest** as the test runner (via Vitest if using Vite).
- **MSW (Mock Service Worker)** for mocking API calls in integration tests.
- **user-event** for simulating user interactions (preferred over `fireEvent`).

## What to Test
- **User-visible behavior:** Does the component render the right content? Does clicking a button trigger the right action?
- **State changes:** Does the UI update when data changes?
- **API integration:** Do components display data from API calls correctly? Do they handle loading, error, and empty states?
- **Edge cases:** Empty data, very long strings, zero values, null values.
- **Accessibility:** Can interactive elements be reached via keyboard?

## What NOT to Test
- **Implementation details:** Don't test internal state variables, private functions, or component internals.
- **Third-party libraries:** Don't test that React Query works — test that your component uses it correctly.
- **Styles:** Don't test that a CSS class is applied — test the visible outcome if critical.
- **Snapshot tests:** Avoid unless there's a specific reason. They break on every change and rarely catch real bugs.

## Test Structure

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard label="Total" value={42} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<StatCard label="Total" value={42} onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Naming Conventions
- Test files: `ComponentName.test.tsx` or `utilName.test.ts`
- Colocate with source: `StatCard.tsx` and `StatCard.test.tsx` in the same directory
- Describe blocks: component or function name
- Test names: plain English describing the behavior — "renders the label and value", "handles empty data gracefully"

## Coverage
- Minimum threshold: **80%** overall.
- All new components and utility functions must have tests.
- Run `npm run test:coverage` before creating a PR.
- Coverage reports are checked by CI — PRs below threshold are blocked.

## Mocking API Calls

Use MSW for API mocking. Define handlers in a shared location:

```typescript
// src/tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/items', () => {
    return HttpResponse.json({ data: mockItems, total: 10 });
  }),
];
```

- Never mock `fetch` directly — use MSW.
- Keep mock data realistic and typed.
- Test error responses too — not just happy paths.

## Running Tests
- `npm test` — run all tests
- `npm run test:watch` — watch mode during development
- `npm run test:coverage` — generate coverage report
- Tests must pass before committing. No exceptions.
