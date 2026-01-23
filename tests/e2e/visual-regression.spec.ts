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

});
