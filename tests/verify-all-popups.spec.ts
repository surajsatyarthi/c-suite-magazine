import { test, expect } from '@playwright/test'

const scenarios = [
    {
        name: 'Rich Stinson - Production',
        url: 'https://csuitemagazine.global/csa/rich-stinson-visionary-leader-powering-america-s-electrification-future',
        sponsor: 'Brkaert'
    },
    {
        name: 'Stella Ambrose - Production',
        url: 'https://csuitemagazine.global/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership',
        sponsor: 'Bufflow'
    },
    {
        name: 'Rich Stinson - Localhost',
        url: 'http://localhost:3000/csa/rich-stinson-visionary-leader-powering-america-s-electrification-future',
        sponsor: 'Brkaert'
    },
    {
        name: 'Stella Ambrose - Localhost',
        url: 'http://localhost:3000/csa/stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership',
        sponsor: 'Bufflow'
    }
]

test.describe('CSA Popup Ad Testing - All 4 Scenarios', () => {
    for (const scenario of scenarios) {
        test(scenario.name, async ({ page }) => {
            console.log(`\n=== Testing: ${scenario.name} ===`)

            await page.goto(scenario.url)
            await page.waitForLoadState('networkidle')

            // Check if article loaded
            const hasArticle = await page.locator('article').count() > 0
            console.log(`Article loaded: ${hasArticle ? '✅' : '❌'}`)

            // Check for sponsor ad in article
            const sponsorAd = page.locator(`article img[alt*="${scenario.sponsor}"], article a[href*="${scenario.sponsor.toLowerCase()}"]`).first()
            const hasSponsorAd = await sponsorAd.count() > 0
            console.log(`Sponsor ad visible: ${hasSponsorAd ? '✅' : '❌'}`)

            if (hasSponsorAd) {
                // Scroll to ad
                await sponsorAd.scrollIntoViewIfNeeded()
                await page.waitForTimeout(2000) // Wait for intersection observer

                // Check for popup
                const popup = page.locator('[data-ad-popup]')
                const hasPopup = await popup.isVisible().catch(() => false)
                console.log(`Popup appeared: ${hasPopup ? '✅' : '❌'}`)

                // Log result
                console.log(`\n✅ RESULT: ${scenario.name} → Popup ${hasPopup ? 'WORKS' : 'DOES NOT WORK'}`)
            } else {
                console.log(`\n❌ RESULT: ${scenario.name} → No sponsor ad found`)
            }
        })
    }
})
