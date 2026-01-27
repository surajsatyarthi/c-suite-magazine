import { test, expect } from '@playwright/test';
import { visualExpect } from './utils/visual';
import { dismissLocaleModal } from './test-utils';

test.describe('The Eagle - Visual Regression Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Suppress locale modal via localStorage before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem('localeSelected', 'true');
      window.localStorage.setItem('localePopupDismissed', '1');
    });
    await page.goto('/');
    // Fallback dismissal just in case
    await dismissLocaleModal(page);
  });

  test('Homepage Executive in Focus (Issue #3)', async ({ page }) => {
    // Wait for critical elements to stabilize
    const executiveInFocus = page.locator('section:has-text("Executive in Focus")');
    await expect(executiveInFocus).toBeVisible({ timeout: 20000 });
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Snapshot the Executive in Focus section
    await visualExpect(executiveInFocus, 'homepage-executive-in-focus.png', {
      maxDiffPixels: 500 // Higher tolerance for fonts
    });
  });

  test('Homepage Spotlight Grid (Issue #3)', async ({ page }) => {
    // The "C-Suite Spotlight" grid is the second target
    const spotlightGrid = page.locator('#csuite-spotlight');
    await expect(spotlightGrid).toBeVisible({ timeout: 20000 });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Snapshot the Spotlight grid
    await visualExpect(spotlightGrid, 'homepage-spotlight-grid.png', {
      mask: [page.locator('.ad-slot')],
      maxDiffPixels: 500
    });
  });

  test('Scroll Freeze / Modal Cleanup (Issue #24)', async ({ page }) => {
    // Wait for page load
    await expect(page.locator('body')).toBeVisible();

    // Trigger potential locale modal (if applicable) or verify initial state
    // We strictly check that the body does NOT have 'overflow: hidden'
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

    // Take a snapshot of the "clean" state
    // This ensures no gray backdrops or stuck modals are visible
    await visualExpect(page, 'homepage-clean-state.png', {
       mask: [page.locator('.ad-slot')],
       maxDiffPixels: 200
    });
  });

  test('CXO Interview Page (Revenue Registry)', async ({ page }) => {
    // Navigate to a high-traffic CXO interview (Rich Stinson)
    await page.goto('/csa/rich-stinson-ceo-southwire');
    await dismissLocaleModal(page);

    const articleLayout = page.locator('article');
    await expect(articleLayout).toBeVisible({ timeout: 20000 });
    
    await page.evaluate(() => document.fonts.ready);

    await visualExpect(articleLayout, 'revenue-cxO-interview.png', {
      mask: [page.locator('.ad-slot')],
      maxDiffPixels: 1000 // Complex layout
    });
  });

  test('Search Results Page (Revenue Registry)', async ({ page }) => {
    // Navigate to search with a common query
    await page.goto('/search?q=sustainability');
    await dismissLocaleModal(page);

    const searchResults = page.locator('main').first();
    await expect(searchResults).toBeVisible({ timeout: 20000 });

    await page.evaluate(() => document.fonts.ready);

    await visualExpect(searchResults, 'revenue-search-results.png', {
      mask: [page.locator('.ad-slot')],
      maxDiffPixels: 800
    });
  });

  test('Executive Salary Index (Revenue Registry)', async ({ page }) => {
    await page.goto('/executive-salaries');
    await dismissLocaleModal(page);

    const salaryGrid = page.locator('main');
    await expect(salaryGrid).toBeVisible({ timeout: 20000 });
    await expect(page.getByPlaceholder('Search executives...')).toBeVisible();

    await page.evaluate(() => document.fonts.ready);

    await visualExpect(salaryGrid, 'revenue-salary-index.png', {
      mask: [page.locator('.ad-slot')],
      maxDiffPixels: 1000
    });
  });

  test('Executive Salary Detail (Revenue Registry)', async ({ page }) => {
    // Targeting a known high-traffic profile
    await page.goto('/executive-salaries/sundar-pichai-alphabet');
    await dismissLocaleModal(page);

    const salaryDetail = page.locator('article');
    await expect(salaryDetail).toBeVisible({ timeout: 20000 });
    
    // Validate key data presence before snapshot
    await expect(page.getByText('Total Compensation')).toBeVisible();

    await page.evaluate(() => document.fonts.ready);

    await visualExpect(salaryDetail, 'revenue-salary-detail.png', {
      mask: [page.locator('.ad-slot')],
      maxDiffPixels: 1000
    });
  });

});
