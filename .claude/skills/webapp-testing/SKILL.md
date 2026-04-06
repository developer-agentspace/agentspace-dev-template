---
name: webapp-testing
description: Playwright E2E testing patterns for browser-based testing
---

## When to Use
Use Playwright for end-to-end tests that verify user-facing behavior in a real browser.

## File Structure
- All E2E tests go in the `e2e/` directory
- Test files must end with `.spec.ts`
- Use descriptive file names: `e2e/boe-search.spec.ts`, `e2e/dashboard.spec.ts`

## Selectors (in order of preference)
1. `getByRole()` — accessible and resilient
2. `getByText()` — visible text content
3. `getByPlaceholder()` — form inputs
4. `getByTestId()` — use `data-testid` for complex elements
5. NEVER use CSS class selectors — they break when styling changes

## Test Structure
- Use `test.describe()` to group related tests
- Use `test.beforeEach()` for shared navigation
- Each test must be independent — no shared state between tests
- Name tests as user actions: "should display results when query is entered"

## Assertions
- `await expect(element).toBeVisible()` — element is on screen
- `await expect(page).toHaveURL(/pattern/)` — navigation worked
- `await expect(element).toHaveText('expected')` — content matches

## Waiting
- Playwright auto-waits for elements — do not add manual sleep or waitForTimeout
- Use `await page.waitForLoadState('networkidle')` only for API calls
- Use `await expect(element).toBeVisible()` instead of manual waits

## Running Tests
- `npm run test:e2e` — run all E2E tests headless
- `npm run test:e2e:ui` — visual UI mode for debugging
- `npx playwright test e2e/specific.spec.ts` — run one file
