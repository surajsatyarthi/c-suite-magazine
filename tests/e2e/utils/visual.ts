import { expect, type Page, type Locator, type TestInfo } from '@playwright/test';

/**
 * Visual Assertion Helper (CI-First Strategy)
 * 
 * - macOS (Local): Uses `expect.soft` to allow development to continue even if 
 *   font rendering differs from the Linux baseline. Logs a warning.
 * - Linux (CI): Uses `expect` (hard) to enforce the "Source of Truth" baseline.
 * - Other: Uses hard assertion.
 * 
 * @param target - Playwright Page or Locator object
 * @param name - Snapshot filename (e.g. 'homepage-spotlight.png')
 * @param options - Optional threshold/mask options
 */
export async function visualExpect(
  target: Page | Locator, 
  name: string, 
  options?: { 
    threshold?: number; 
    maxDiffPixels?: number; 
    mask?: Array<Locator>; 
  }
) {
  const isMac = process.platform === 'darwin';
  
  // Default options to avoid flakes
  const defaultOptions = {
    threshold: 0.2, // Allow manageable anti-aliasing diffs
    maxDiffPixels: 100, // Ignore tiny localized noise
    ...options
  };

  if (isMac) {
    // Soft assertion for local Mac dev (don't block workflow)
    await expect.soft(target).toHaveScreenshot(name, defaultOptions);
  } else {
    // Hard assertion for CI (strict baseline)
    await expect(target).toHaveScreenshot(name, defaultOptions);
  }
}
