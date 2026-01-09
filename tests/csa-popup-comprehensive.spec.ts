import { test, expect, Page } from '@playwright/test'

/**
 * Comprehensive CSA Popup System Tests
 * Tests all 3 popup types with their specific cooldown behaviors
 */

// Test configuration
const LOCALHOST = 'http://localhost:3000'
const STELLA_ARTICLE = `${LOCALHOST}/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership`
const RICH_ARTICLE = `${LOCALHOST}/csa/rich-stinson-visionary-leader-powering-america-s-electrification-future`
const NORMAL_ARTICLE = `${LOCALHOST}/category/leadership/cultural-moat-psychological-safety-competitive-advantage`
const HOMEPAGE = LOCALHOST

// Helper functions
async function clearAllStorage(page: Page) {
    await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
    })
}

async function waitForPopup(page: Page, timeout = 5000) {
    try {
        await page.waitForSelector('[data-ad-popup]', { timeout, state: 'visible' })
        return true
    } catch {
        return false
    }
}

async function closePopup(page: Page) {
    const closeButton = page.locator('[data-ad-popup] button[aria-label="Close popup"]')
    if (await closeButton.isVisible()) {
        await closeButton.click()
        await page.waitForTimeout(500)
    }
}

async function scrollToPercent(page: Page, percent: number) {
    await page.evaluate((p) => {
        const docHeight = document.documentElement.scrollHeight
        const winHeight = window.innerHeight
        const scrollTo = (docHeight - winHeight) * (p / 100)
        window.scrollTo(0, scrollTo)
    }, percent)
    await page.waitForTimeout(1000)
}

test.describe('CSA Popup System - Comprehensive Tests', () => {

    test.beforeEach(async ({ page }) => {
        await clearAllStorage(page)
    })

    test.describe('1. CSA Sponsor Popups (No Cooldown)', () => {

        test('Stella Ambrose - Popup shows on first scroll', async ({ page }) => {
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')

            // Scroll to find the sponsor ad
            let popupAppeared = false
            for (let scroll = 20; scroll <= 80; scroll += 10) {
                await scrollToPercent(page, scroll)
                popupAppeared = await waitForPopup(page, 2000)
                if (popupAppeared) break
            }

            expect(popupAppeared).toBe(true)

            // Verify it's the Bufflow ad
            const popupContent = await page.locator('[data-ad-popup] img').getAttribute('src')
            expect(popupContent).toContain('bufflow')
        })

        test('Stella Ambrose - Popup shows AGAIN on page refresh', async ({ page }) => {
            // First visit
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Refresh page (same session)
            await page.reload()
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            // Should show again (NO COOLDOWN)
            let popup2 = await waitForPopup(page)
            expect(popup2).toBe(true)
        })

        test('Stella Ambrose - Popup shows on multiple scrolls', async ({ page }) => {
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')

            // First scroll
            await scrollToPercent(page, 50)
            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Scroll up
            await scrollToPercent(page, 20)
            await page.waitForTimeout(1000)

            // Scroll down again
            await scrollToPercent(page, 60)
            let popup2 = await waitForPopup(page)
            expect(popup2).toBe(true)
        })

        test('Rich Stinson - Different sponsor shows different popup', async ({ page }) => {
            // Visit Rich Stinson
            await page.goto(RICH_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            let popup = await waitForPopup(page)
            expect(popup).toBe(true)

            // Verify it's Brkaert (not Bufflow)
            const popupContent = await page.locator('[data-ad-popup] img').getAttribute('src')
            expect(popupContent).toContain('brkaert')
        })

        test('Both CSA articles can show popups in same session', async ({ page }) => {
            // Visit Stella
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Visit Rich in same session
            await page.goto(RICH_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let popup2 = await waitForPopup(page)
            expect(popup2).toBe(true)
        })
    })

    test.describe('2. Regular Article Popups (Session-based)', () => {

        test('Normal article - Popup shows on first visit', async ({ page }) => {
            await page.goto(NORMAL_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            let popup = await waitForPopup(page)
            expect(popup).toBe(true)
        })

        test('Normal article - Popup does NOT show on second article (same session)', async ({ page }) => {
            // First article
            await page.goto(NORMAL_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Second article (different URL, same session)
            await page.goto(`${LOCALHOST}/category/opinion/steve-jobs-7-principles-for-unstoppable-success`)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            // Should NOT show (session-based cooldown)
            let popup2 = await waitForPopup(page, 3000)
            expect(popup2).toBe(false)
        })

        test('Normal article - Popup does NOT show on page refresh', async ({ page }) => {
            await page.goto(NORMAL_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Refresh
            await page.reload()
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            // Should NOT show (same session)
            let popup2 = await waitForPopup(page, 3000)
            expect(popup2).toBe(false)
        })

        test('Normal article - Popup shows in new context (simulated new session)', async ({ page, context }) => {
            // First session
            await page.goto(NORMAL_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Simulate new session by clearing sessionStorage
            await page.evaluate(() => sessionStorage.clear())

            // Same article, "new session"
            await page.reload()
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            // Should show again (new session)
            let popup2 = await waitForPopup(page)
            expect(popup2).toBe(true)
        })
    })

    test.describe('3. Homepage Popup (2-hour cooldown)', () => {

        test('Homepage - Popup shows after 10 second delay', async ({ page }) => {
            await page.goto(HOMEPAGE)
            await page.waitForLoadState('networkidle')

            // Should NOT show immediately
            let immediate = await waitForPopup(page, 2000)
            expect(immediate).toBe(false)

            // Wait for 10 second delay
            await page.waitForTimeout(10000)

            // Should show now
            let delayed = await waitForPopup(page, 2000)
            expect(delayed).toBe(true)
        })

        test('Homepage - Popup does NOT show on immediate revisit', async ({ page }) => {
            // First visit
            await page.goto(HOMEPAGE)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(10000)
            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Navigate away
            await page.goto(NORMAL_ARTICLE)
            await page.waitForTimeout(1000)

            // Return to homepage immediately
            await page.goto(HOMEPAGE)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(10000)

            // Should NOT show (within 2-hour cooldown)
            let popup2 = await waitForPopup(page, 2000)
            expect(popup2).toBe(false)
        })

        test('Homepage - Popup shows after 2-hour cooldown (simulated)', async ({ page }) => {
            // First visit
            await page.goto(HOMEPAGE)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(10000)
            let popup1 = await waitForPopup(page)
            expect(popup1).toBe(true)
            await closePopup(page)

            // Simulate 2 hours passing by manipulating localStorage
            await page.evaluate(() => {
                const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000 + 1000)
                localStorage.setItem('popup-ad-last-shown', twoHoursAgo.toString())
            })

            // Return to homepage
            await page.goto(HOMEPAGE)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(10000)

            // Should show again (2+ hours passed)
            let popup2 = await waitForPopup(page)
            expect(popup2).toBe(true)
        })
    })

    test.describe('4. Integration Tests (Multiple popup types)', () => {

        test('All three popup types can show in one session', async ({ page }) => {
            // 1. Homepage popup
            await page.goto(HOMEPAGE)
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(10000)
            let homepagePopup = await waitForPopup(page)
            expect(homepagePopup).toBe(true)
            await closePopup(page)

            // 2. Regular article popup
            await page.goto(NORMAL_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let articlePopup = await waitForPopup(page)
            expect(articlePopup).toBe(true)
            await closePopup(page)

            // 3. CSA popup
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let csaPopup = await waitForPopup(page)
            expect(csaPopup).toBe(true)
        })

        test('CSA popup does not affect article popup cooldown', async ({ page }) => {
            // First show CSA popup
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let csaPopup = await waitForPopup(page)
            expect(csaPopup).toBe(true)
            await closePopup(page)

            // Article popup should still show (independent cooldowns)
            await page.goto(NORMAL_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)
            let articlePopup = await waitForPopup(page)
            expect(articlePopup).toBe(true)
        })
    })

    test.describe('5. Field Name Tests (isPopupTrigger, targetUrl)', () => {

        test('CSA popup uses correct targetUrl from Sanity', async ({ page }) => {
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            await waitForPopup(page)

            // Check that the popup link has the correct targetUrl
            const link = page.locator('[data-ad-popup] a')
            const href = await link.getAttribute('href')
            expect(href).toContain('bufflow.my')
        })

        test('Popup is clickable and has correct target', async ({ page }) => {
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            await waitForPopup(page)

            // Verify link exists and is clickable
            const link = page.locator('[data-ad-popup] a')
            expect(await link.isVisible()).toBe(true)

            const href = await link.getAttribute('href')
            expect(href).toMatch(/^https?:\/\//)
        })
    })

    test.describe('6. User Experience Tests', () => {

        test('Popup can be closed with close button', async ({ page }) => {
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            await waitForPopup(page)

            const closeButton = page.locator('[data-ad-popup] button[aria-label="Close popup"]')
            await closeButton.click()

            // Popup should disappear
            const popupVisible = await page.locator('[data-ad-popup]').isVisible()
            expect(popupVisible).toBe(false)
        })

        test('Popup can be closed with Escape key', async ({ page }) => {
            await page.goto(STELLA_ARTICLE)
            await page.waitForLoadState('networkidle')
            await scrollToPercent(page, 50)

            await waitForPopup(page)

            await page.keyboard.press('Escape')
            await page.waitForTimeout(500)

            // Popup should disappear
            const popupVisible = await page.locator('[data-ad-popup]').isVisible()
            expect(popupVisible).toBe(false)
        })
    })
})
