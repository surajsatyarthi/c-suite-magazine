import { test, expect } from '@playwright/test'
import { Page } from '@playwright/test'
import { dismissLocaleModal } from './test-utils'

test.describe('Breadcrumb Navigation', () => {
    test('Article breadcrumbs show Home and Category (no title)', async ({ page }) => {
        // Use a regular leadership article (CSAs route to /csa/)
        await page.goto('/category/leadership/asynchronous-enterprise-meetings-enemy-scale');

        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(breadcrumbs).toContainText('Home');
        await expect(breadcrumbs).toContainText('Leadership');

        // Should NOT contain the full article title
        await expect(breadcrumbs).not.toContainText('The Culture Code: How Erin Krueger Turns Teams Into High-Performing Cultures')

        // Count breadcrumb items (should be 2: Home + Category)
        const items = breadcrumbs.locator('span.flex.items-center.gap-2')
        await expect(items).toHaveCount(2)
    })

    test('CSA article shows "CXO Interview" not "Company Sponsored"', async ({ page }) => {
        // Test CSA article (Stella Ambrose)
        await page.goto('/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership')

        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]')
        // Allow time for navigation to settle
        await page.waitForLoadState('domcontentloaded')

        await expect(breadcrumbs).toContainText('Home');
        // Stella Ambrose is categorized as CXO Interview in Sanity
        await expect(breadcrumbs).toContainText('CXO Interview');
        await expect(breadcrumbs).not.toContainText('Company Sponsored');

        // Should NOT contain article title
        await expect(breadcrumbs).not.toContainText('Stella Ambrose')
    })
    
    test('CSA article routes strictly to /csa/ and NOT /category/', async ({ page }) => {
        // This test confirms we solved the Duplicate URL issue
        const slug = 'stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership'
        
        // 1. Visit correctly
        const csaResponse = await page.goto(`/csa/${slug}`)
        expect(csaResponse?.status()).toBe(200)

        // 2. Visit incorrectly (old duplicate path)
        // With our new logic, this should either 404 or redirect (depending on how getPost fails)
        // Since we filtered out CSA from category page query, it should 404.
        const categoryResponse = await page.goto(`/category/choice-interview/${slug}`)
        // Note: category name might be different, let's try generic
        const categoryResponse2 = await page.goto(`/category/cxo-interview/${slug}`)
        
        // We expect 404 because the query *[_type == "post"] will verify it's NOT a CSA
        // If it returns 200, we still have the duplicate content bug!
        expect(categoryResponse2?.status()).toBe(404)
    })

    test('Breadcrumb links are functional', async ({ page }) => {
        await page.goto('/category/leadership/asynchronous-enterprise-meetings-enemy-scale');
        await dismissLocaleModal(page);

        // Click category in breadcrumb - use a lenient text-based selector
        await page.locator('nav[aria-label="Breadcrumb"] a').filter({ hasText: /Leadership/i }).click();
        
        await expect(page).toHaveURL(/.*\/category\/leadership/);

        // Click Home
        await page.locator('nav[aria-label="Breadcrumb"] a').filter({ hasText: /Home/i }).click();
        await expect(page).toHaveURL('/');
    });

    test('Breadcrumbs for articles without categories handle gracefully', async ({ page }) => {
        // If an article somehow has no category, breadcrumb should still work
        // This test verifies graceful degradation
        await page.goto('/category/cxo-interview/erin-krueger')

        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]')
        // Should always have at least Home
        await expect(breadcrumbs).toContainText('Home')
    })
})

test.describe('Category Navigation Header', () => {
    test('"Company Sponsored" does not appear in header', async ({ page }) => {
        await page.goto('/')

        const categoryNav = page.locator('nav[aria-label="Article categories"]')
        await expect(categoryNav).not.toContainText('Company Sponsored')
    })

    test('Header shows only public categories', async ({ page }) => {
        await page.goto('/')

        const categoryNav = page.locator('nav[aria-label="Article categories"]')

        // Should include public categories
        await expect(categoryNav).toContainText('CXO Interview')

        // Should NOT include internal categories
        await expect(categoryNav).not.toContainText('Company Sponsored')
    })
})

test.describe('Schema.org Breadcrumb Structured Data', () => {
    test('Breadcrumb JSON-LD has 2 items (Home + Category)', async ({ page }) => {
        await page.goto('/category/leadership/asynchronous-enterprise-meetings-enemy-scale');

        const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
        const breadcrumbData = scripts
            .map(s => JSON.parse(s))
            .find(d => d['@type'] === 'BreadcrumbList');

        expect(breadcrumbData).toBeDefined();
        // Should have exactly 2 items: Home + Category
        expect(breadcrumbData.itemListElement.length).toBe(2);
        expect(breadcrumbData.itemListElement[0].name).toBe('Home');
        expect(breadcrumbData.itemListElement[1].name).toBe('Leadership');
    });

    test('CSA article JSON-LD shows "CXO Interview"', async ({ page }) => {
        await page.goto('/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership');
        await dismissLocaleModal(page);

        const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
        const breadcrumbData = scripts
            .map(s => JSON.parse(s))
            .find(d => d['@type'] === 'BreadcrumbList');

        expect(breadcrumbData).toBeDefined();
        expect(breadcrumbData['@type']).toBe('BreadcrumbList');
        // Should include "CXO Interview" not "Company Sponsored"
        const names = breadcrumbData.itemListElement.map((item: any) => item.name);
        expect(names).toContain('CXO Interview');
        expect(names).not.toContain('Company Sponsored');
        // Should have exactly 2 items
        expect(names.length).toBe(2);
    });
})
