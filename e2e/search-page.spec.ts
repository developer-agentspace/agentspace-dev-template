/**
 * TEMPLATE: Search Page E2E Test
 *
 * Fill in the selectors and URLs when starting a new project.
 * This template covers the standard search flow:
 * page load → type query → see results → click result → navigate to detail
 */
import { test, expect } from '@playwright/test';

// [FILL_PER_PROJECT] — Update these for your project
const SEARCH_URL = '/search'; // e.g., '/boe/search', '/shipping-bills'
const SEARCH_PLACEHOLDER = 'Search...'; // The placeholder text on the search input
const RESULT_DETAIL_URL_PATTERN = /\/detail\//; // e.g., /\/boe\/\d+/

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SEARCH_URL);
  });

  test('search page loads with input visible', async ({ page }) => {
    const searchInput = page.getByPlaceholder(SEARCH_PLACEHOLDER);
    await expect(searchInput).toBeVisible();
  });

  test('search input accepts text', async ({ page }) => {
    const searchInput = page.getByPlaceholder(SEARCH_PLACEHOLDER);
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
  });

  test('search returns results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(SEARCH_PLACEHOLDER);
    await searchInput.fill('test');
    await searchInput.press('Enter');

    // Wait for results table or list to appear
    const results = page.getByRole('table');
    await expect(results).toBeVisible({ timeout: 10000 });
  });

  test('results table has expected columns', async ({ page }) => {
    const searchInput = page.getByPlaceholder(SEARCH_PLACEHOLDER);
    await searchInput.fill('test');
    await searchInput.press('Enter');

    await page.waitForLoadState('networkidle');

    // [FILL_PER_PROJECT] — Update column headers for your project
    const expectedColumns = ['Number', 'Date', 'Status'];
    for (const col of expectedColumns) {
      await expect(page.getByRole('columnheader', { name: new RegExp(col, 'i') })).toBeVisible();
    }
  });

  test('clicking a result navigates to detail page', async ({ page }) => {
    const searchInput = page.getByPlaceholder(SEARCH_PLACEHOLDER);
    await searchInput.fill('test');
    await searchInput.press('Enter');

    await page.waitForLoadState('networkidle');

    // Click the first result row
    const firstRow = page.getByRole('row').nth(1); // nth(0) is header
    await firstRow.click();

    await expect(page).toHaveURL(RESULT_DETAIL_URL_PATTERN);
  });
});
