import { test, expect } from '@playwright/test';

test.describe('Indian Oil CSA - Ad Integration Tests', () => {
  const articleUrl = '/csa/shrikant-vaidya-chairman-indianoil';

  test('should display all 5 advertiser images', async ({ page }) => {
    await page.goto(articleUrl);
    
    // Wait for article content to load
    await page.waitForSelector('article', { timeout: 10000 });
    
    // Check for all 5 ad images by caption or alt text
    const allImages = page.locator('article img');
    const imageCount = await allImages.count();
    
    console.log(`Total images in article: ${imageCount}`);
    
    // Look for advertiser images (should have captions or specific alt text)
    const ltHydrocarbon = page.locator('article img[alt*="LT Hydrocarbon" i]');
    const technipIndia = page.locator('article img[alt*="Technip India" i]');
    const isgec = page.locator('article img[alt*="Isgec" i]');
    const sudChemie = page.locator('article img[alt*="Sud-Chemie" i], article img[alt*="Sud Chemie" i]');
    const graceProducts = page.locator('article img[alt*="Grace Products" i]');
    
    // Verify all ads are visible
    await expect(ltHydrocarbon).toBeVisible({ timeout: 5000 });
    await expect(technipIndia).toBeVisible({ timeout: 5000 });
    await expect(isgec).toBeVisible({ timeout: 5000 });
    await expect(sudChemie).toBeVisible({ timeout: 5000 });
    await expect(graceProducts).toBeVisible({ timeout: 5000 });
    
    console.log('✅ All 5 advertiser images are visible');
  });

  test('should load all ad images without 404 errors', async ({ page }) => {
    const imageErrors: { url: string; status: number }[] = [];
    
    page.on('response', response => {
      if (response.request().resourceType() === 'image' && response.status() !== 200) {
        imageErrors.push({ url: response.url(), status: response.status() });
      }
    });
    
    await page.goto(articleUrl);
    await page.waitForLoadState('networkidle');
    
    if (imageErrors.length > 0) {
      console.error('❌ Image loading errors:', imageErrors);
    }
    
    expect(imageErrors).toHaveLength(0);
    console.log('✅ All images loaded successfully (no 404 errors)');
  });

  test('should maintain acceptable page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(articleUrl);
    await page.waitForSelector('article');
    
    const loadTime = Date.now() - startTime;
    
    console.log(`Page load time: ${loadTime}ms`);
    
    // Ensure load time is under 15 seconds (reasonable for article with images during next dev cold starts)
    expect(loadTime).toBeLessThan(15000);
    console.log('✅ Page load performance is acceptable');
  });

  test('should display ad images correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport (iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(articleUrl);
    
    // Wait for content
    await page.waitForSelector('article');
    
    // Find all ad images  
    const adImages = page.locator('article img[alt*="Advert" i]');
    const count = await adImages.count();
    
    console.log(`Ad images found on mobile: ${count}`);
    
    if (count === 0) {
      // Try alternative selector
      const allImages = page.locator('article img');
      const totalImages = await allImages.count();
      console.log(`Total images on mobile: ${totalImages}`);
      
      // At minimum, article should have some images
      expect(totalImages).toBeGreaterThan(0);
    }
    
    // Check that images are visible and not overflowing
    const allImages = page.locator('article img');
    const imageCount = await allImages.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = allImages.nth(i);
      await expect(img).toBeVisible();
      
      // Check image doesn't exceed viewport width
      const boundingBox = await img.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(400); // Allow for some margin
      }
    }
    
    console.log('✅ Ad images render correctly on mobile viewport');
  });

  test('should have proper alt text for all ad images', async ({ page }) => {
    await page.goto(articleUrl);
    await page.waitForSelector('article');
    
    // Get all images in the article
    const images = page.locator('article img');
    const count = await images.count();
    
    let missingAltText = 0;
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt || alt.trim() === '') {
        missingAltText++;
      }
    }
    
    console.log(`Images with alt text: ${count - missingAltText}/${count}`);
    
    // All images should have alt text for accessibility
    expect(missingAltText).toBe(0);
    console.log('✅ All images have proper alt text');
  });
});
