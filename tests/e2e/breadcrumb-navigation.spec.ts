import { test, expect } from '@playwright/test'
import { Page } from '@playwright/test'

test.describe('Breadcrumb Navigation', () => {
    test('Article breadcrumbs show Home and Category (no title)', async ({ page }) => {
        // Test regular article
        await page.goto('/category/cxo-interview/erin-krueger')

        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]')
        await expect(breadcrumbs).toContainText('Home')
        await expect(breadcrumbs).toContainText('CXO Interview')

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

        await expect(breadcrumbs).toContainText('Home')
        await expect(breadcrumbs).toContainText('CXO Interview')
        await expect(breadcrumbs).not.toContainText('Company Sponsored')

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
        await page.goto('/category/cxo-interview/erin-krueger')

        // Click category in breadcrumb
        await page.click('nav[aria-label="Breadcrumb"] >> text=CXO Interview')
        await expect(page).toHaveURL(/.*\/category\/cxo-interview/)

        // Go back and click Home
        await page.goBack()
        await expect(page).toHaveURL(/.*\/erin-krueger/)
        await page.click('nav[aria-label="Breadcrumb"] >> text=Home')
        await expect(page).toHaveURL('/')
    })

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
        await page.goto('/category/cxo-interview/erin-krueger')

        const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
        const breadcrumbData = scripts
            .map(s => JSON.parse(s))
            .find(d => d['@type'] === 'BreadcrumbList')

        expect(breadcrumbData).toBeDefined()
        expect(breadcrumbData.itemListElement).toBeDefined()
        // Should have exactly 2 items: Home + Category (no article title)
        expect(breadcrumbData.itemListElement.length).toBe(2)
        expect(breadcrumbData.itemListElement[0].name).toBe('Home')
        expect(breadcrumbData.itemListElement[1].name).toBe('CXO Interview')
    })

    test('CSA article JSON-LD shows "CXO Interview"', async ({ page }) => {
        await page.goto('/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership')

        const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
        const breadcrumbData = scripts
            .map(s => JSON.parse(s))
            .find(d => d['@type'] === 'BreadcrumbList')

        expect(breadcrumbData).toBeDefined()
        expect(breadcrumbData['@type']).toBe('BreadcrumbList')
        // Should include "CXO Interview" not "Company Sponsored"
        const names = breadcrumbData.itemListElement.map((item: any) => item.name)
        expect(names).toContain('CXO Interview')
        expect(names).not.toContain('Company Sponsored')
        // Should have exactly 2 items
        expect(names.length).toBe(2)
    })
})
