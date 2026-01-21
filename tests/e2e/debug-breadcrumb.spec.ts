import { test, expect } from '@playwright/test';
import { dismissLocaleModal } from './test-utils';

test('debug breadcrumb', async ({ page }) => {
    await page.goto('/category/leadership/asynchronous-enterprise-meetings-enemy-scale');
    await dismissLocaleModal(page);
    const breadcrumbs = await page.locator('nav[aria-label="Breadcrumb"]').textContent();
    console.log('BREADCRUMB TEXT:', breadcrumbs);
    
    const links = await page.locator('nav[aria-label="Breadcrumb"] a').allTextContents();
    console.log('BREADCRUMB LINKS:', links);
});
