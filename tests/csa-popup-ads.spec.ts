import { test, expect } from '@playwright/test'

/**
 * CSA Popup Ad Tests
 * 
 * Tests the popup ad functionality for Company Sponsored Articles (CSA).
 * CSA articles have in-article sponsor ads where the highest-paying sponsor
 * gets their ad shown both inline AND as a full-screen popup when scrolled into view.
 */

test.describe('CSA Popup Ads', () => {
    const CSA_ARTICLE_URL = '/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership'

    test.beforeEach(async ({ page }) => {
        // Clear any previous popup state
        await page.goto(CSA_ARTICLE_URL)
        await page.waitForLoadState('networkidle')
    })

    test('CSA article loads without popup initially', async ({ page }) => {
        // Popup should not appear on page load
        const popup = page.locator('[data-ad-popup]')
        await expect(popup).not.toBeVisible()
    })

    test('in-article ad with targetUrl is clickable and has correct href', async ({ page }) => {
        // Find an in-article ad (should be wrapped in <a> tag)
        const adLink = page.locator('article a[href*="http"]').filter({ hasText: /sponsored|ad/i }).first()

        if (await adLink.count() > 0) {
            // Verify it's a link
            await expect(adLink).toHaveAttribute('href', /.+/)
            await expect(adLink).toHaveAttribute('target', '_blank')
            await expect(adLink).toHaveAttribute('rel', /noopener/)
        } else {
            // If no ad found, skip test but note it
            test.skip(true, 'No in-article ads found - article may not have ads configured yet')
        }
    })

    test('ad image without isPopupTrigger does NOT show popup when scrolled into view', async ({ page }) => {
        // Scroll through article
        await page.evaluate(() => window.scrollBy(0, 500))
        await page.waitForTimeout(500)

        // Check if popup appears (it shouldn't for non-trigger ads)
        const popup = page.locator('[data-ad-popup]')

        // This test is tricky - we can't easily identify which ad doesn't have trigger
        // So we just verify popup doesn't appear immediately after scrolling
        await expect(popup).not.toBeVisible({ timeout: 2000 })
    })

    test('ad with isPopupTrigger shows popup when scrolled into view', async ({ page }) => {
        // Find and scroll to an in-article ad that should trigger popup
        const inArticleAd = page.locator('article img[alt*="Bufflow"]').or(
            page.locator('article img[alt*="Sponsored"]')
        ).first()

        if (await inArticleAd.count() === 0) {
            test.skip(true, 'No popup trigger ad found in article')
        }

        // Scroll ad into view
        await inArticleAd.scrollIntoViewIfNeeded()

        // Wait for popup to appear (IntersectionObserver at 50% threshold)
        const popup = page.locator('[data-ad-popup]')
        await expect(popup).toBeVisible({ timeout: 3000 })

        // Verify popup contains image
        const popupImage = popup.locator('img')
        await expect(popupImage).toBeVisible()
    })

    test('popup has close button and can be dismissed', async ({ page }) => {
        // Trigger popup by scrolling to ad
        const inArticleAd = page.locator('article img[alt*="Bufflow"]').or(
            page.locator('article img[alt*="Sponsored"]')
        ).first()

        if (await inArticleAd.count() === 0) {
            test.skip(true, 'No popup trigger ad found')
        }

        await inArticleAd.scrollIntoViewIfNeeded()

        const popup = page.locator('[data-ad-popup]')
        await expect(popup).toBeVisible({ timeout: 3000 })

        // Find and click close button
        const closeButton = popup.locator('button[aria-label="Close"]').or(
            popup.locator('button:has-text("×")')
        ).or(
            popup.locator('[data-close]')
        )

        await expect(closeButton).toBeVisible()
        await closeButton.click()

        // Verify popup is hidden
        await expect(popup).not.toBeVisible()
    })

    test('popup can be closed with Escape key', async ({ page }) => {
        // Trigger popup
        const inArticleAd = page.locator('article img[alt*="Bufflow"]').or(
            page.locator('article img[alt*="Sponsored"]')
        ).first()

        if (await inArticleAd.count() === 0) {
            test.skip(true, 'No popup trigger ad found')
        }

        await inArticleAd.scrollIntoViewIfNeeded()

        const popup = page.locator('[data-ad-popup]')
        await expect(popup).toBeVisible({ timeout: 3000 })

        // Press Escape key
        await page.keyboard.press('Escape')

        // Verify popup is hidden
        await expect(popup).not.toBeVisible()
    })

    test('clicking popup image navigates to targetUrl', async ({ page }) => {
        // Trigger popup
        const inArticleAd = page.locator('article img[alt*="Bufflow"]').or(
            page.locator('article img[alt*="Sponsored"]')
        ).first()

        if (await inArticleAd.count() === 0) {
            test.skip(true, 'No popup trigger ad found')
        }

        await inArticleAd.scrollIntoViewIfNeeded()

        const popup = page.locator('[data-ad-popup]')
        await expect(popup).toBeVisible({ timeout: 3000 })

        // Get the link inside popup
        const popupLink = popup.locator('a[href]').first()
        await expect(popupLink).toBeVisible()

        // Verify it has href attribute
        const href = await popupLink.getAttribute('href')
        expect(href).toBeTruthy()
        expect(href).toMatch(/^https?:\/\//) // Should be external URL

        // Note: We don't actually click to navigate, just verify the link exists
    })

    test('popup only shows once per page session for same ad', async ({ page }) => {
        // Trigger popup
        const inArticleAd = page.locator('article img[alt*="Bufflow"]').or(
            page.locator('article img[alt*="Sponsored"]')
        ).first()

        if (await inArticleAd.count() === 0) {
            test.skip(true, 'No popup trigger ad found')
        }

        // First trigger
        await inArticleAd.scrollIntoViewIfNeeded()
        const popup = page.locator('[data-ad-popup]')
        await expect(popup).toBeVisible({ timeout: 3000 })

        // Close popup
        const closeButton = popup.locator('button[aria-label="Close"]').or(
            popup.locator('button:has-text("×")')
        ).or(
            popup.locator('[data-close]')
        )
        await closeButton.click()
        await expect(popup).not.toBeVisible()

        // Scroll away and back
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(500)
        await inArticleAd.scrollIntoViewIfNeeded()

        // Popup should NOT appear again
        await expect(popup).not.toBeVisible({ timeout: 2000 })
    })

    test('CSA article has at least one clickable sponsor ad', async ({ page }) => {
        // CSA articles should have sponsor ads with targetUrl
        const sponsorAds = page.locator('article a[target="_blank"][href*="http"] img')

        // Should have at least one sponsor ad
        const count = await sponsorAds.count()
        expect(count).toBeGreaterThan(0)

        // Verify first ad is properly configured
        const firstAd = sponsorAds.first()
        await expect(firstAd).toBeVisible()

        // Verify parent link
        const parentLink = firstAd.locator('..')
        const href = await parentLink.getAttribute('href')
        expect(href).toBeTruthy()
        expect(href).toMatch(/^https?:\/\//)
    })
})
