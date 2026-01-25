import { test, expect } from '@playwright/test';
import { dismissLocaleModal } from './test-utils';

/**
 * 🛡️ Ralph Protocol v2.7: Digital Twin
 * Goal: Ensure 100% stability for high-revenue assets.
 */

const REVENUE_ARTICLES = [
  { name: 'Stella & Sawit (CSA)', url: '/csa/stella-ambrose-deputy-ceo-sawit-kinabalu' },
  { name: 'Rich Stinson (CSA)', url: '/csa/rich-stinson-ceo-southwire' },
  { name: 'Sukhinder Singh Cassidy (CSA)', url: '/csa/sukhinder-singh-cassidy-rewiring-global-economy' },
];

test.describe('Digital Twin: Revenue Integrity', () => {

  for (const article of REVENUE_ARTICLES) {
    test(`Verify ${article.name} loads and renders correctly`, async ({ page }) => {
      const response = await page.goto(article.url, { timeout: 60000, waitUntil: 'domcontentloaded' });
      
      // 1. Basic Availability
      expect(response?.status()).toBe(200);
      
      // 2. Dismiss Modal
      await dismissLocaleModal(page);
      
      // 3. Content Integrity
      await expect(page.locator('h1')).toBeVisible();
      
      // 4. Visual Integrity (Placeholder for Screenshot logic if needed)
      // await expect(page).toHaveScreenshot({ fullPage: true });
      
      // 5. Hero Visibility
      const heroImage = page.locator('img').first();
      await expect(heroImage).toBeVisible();
    });
  }
});
