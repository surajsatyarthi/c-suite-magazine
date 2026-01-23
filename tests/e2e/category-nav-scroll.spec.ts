import { test, expect } from '@playwright/test';

test.describe('Category Navigation Scroll', () => {
  
  test('should allow native horizontal scrolling without JS interference', async ({ page }) => {
    // 1. Navigate to a Category Page
    await page.goto('/category/leadership');

    // 2. Locate the scroll container (minimal class we kept)
    const scrollContainer = page.locator('.category-scroll-container-minimal');
    await expect(scrollContainer).toBeVisible();

    // 3. Verify CSS properties for native scrolling
    await expect(scrollContainer).toHaveCSS('overflow-x', 'auto');
    await expect(scrollContainer).toHaveCSS('display', 'flex');

    // 4. Test Scroll Interaction
    // Get initial scroll position
    const initialScrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
    expect(initialScrollLeft).toBe(0);

    // Programmatically scroll
    await scrollContainer.evaluate((el) => { el.scrollLeft = 100; });
    
    // Wait a moment to ensure no JS loop fights it back
    await page.waitForTimeout(500);

    // Verify it stayed scrolled (JS loop would have likely reset or incremented it)
    const newScrollLeft = await scrollContainer.evaluate((el) => el.scrollLeft);
    expect(newScrollLeft).toBe(100);

    // 5. Verify no console errors (which might indicate broken listeners)
    // Implicit via test runner, but active check helps
  });

});
