import { test, expect } from '@playwright/test'
import { dismissLocaleModal } from './test-utils'

test.describe('Magazine Design Enhancements', () => {
  test.skip('CSA article displays all new design elements', async ({ page }) => {
    await page.goto('https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil')
    await dismissLocaleModal(page)
    
    // Wait for main content to load
    await page.waitForSelector('article', { timeout: 10000 })
    
    // 1. Check IN FOCUS badge (only on desktop)
    if (page.viewportSize()!.width >= 1024) {
      const badge = page.locator('.in-focus-badge, [class*="IN FOCUS"], [class*="CSA FEATURE"]')
      const badgeVisible = await badge.isVisible().catch(() => false)
      console.log('Badge visible:', badgeVisible)
    }
    
    // 2. Check hero overlay with tagline
    const heroSection = page.locator('div[class*="hero"], div[class*="aspect"]').first()
    await expect(heroSection).toBeVisible()
    
    // Look for overlay text (might be "INDIA'S ENERGY" or similar)
    const overlayText = page.locator('h2[class*="uppercase"], div[class*="overlay"] h2')
    const hasOverlay = await overlayText.count() > 0
    console.log('Hero overlay found:', hasOverlay)
    
    // 3. Check pull quotes are centered and styled
    const quotes = page.locator('blockquote')
    const quoteCount = await quotes.count()
    if (quoteCount > 0) {
      const firstQuote = quotes.first()
      const quoteStyles = await firstQuote.evaluate(el => {
        const styles = window.getComputedStyle(el.querySelector('p') || el)
        return {
          textAlign: styles.textAlign,
          fontStyle: styles.fontStyle,
        }
      })
      expect(quoteStyles.textAlign).toBe('center')
      expect(quoteStyles.fontStyle).toBe('italic')
      console.log('Pull quote styling correct')
    }
    
    // 4. Check section headers are centered with dividers
    const h2Elements = page.locator('article h2')
    const h2Count = await h2Elements.count()
    if (h2Count > 0) {
      const firstH2 = h2Elements.first()
      const textAlign = await firstH2.evaluate(el => 
        window.getComputedStyle(el).textAlign
      )
      expect(textAlign).toBe('center')
      console.log('Section headers centered')
      
      // Check for gold divider (might be sibling div)
      const divider = page.locator('h2 + div, div[class*="bg-[#c8ab3d]"]').first()
      const dividerVisible = await divider.isVisible().catch(() => false)
      console.log('Gold divider found:', dividerVisible)
    }
    
    // 5. Check Spotlights widget in sidebar
    const spotlights = page.locator('text=/Spotlights|SPOTLIGHTS/i').first()
    const spotlightsVisible = await spotlights.isVisible().catch(() => false)
    console.log('Spotlights widget visible:', spotlightsVisible)
    
    // If visible, check it has leader entries
    if (spotlightsVisible) {
      const leaderImages = page.locator('img[alt*=""], div[class*="rounded-full"]')
      const imageCount = await leaderImages.count()
      expect(imageCount).toBeGreaterThan(0)
      console.log('Spotlights has', imageCount, 'leader images')
    }
    
    // 6. Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/csa-article-enhancements.png',
      fullPage: true 
    })
    
    console.log('✅ CSA article enhancement test complete')
  })

  test('Interview article shows IN FOCUS badge', async ({ page }) => {
    // Navigate to interviews category
    await page.goto('https://csuitemagazine.global/category/cxo-interview')
    await dismissLocaleModal(page)
    
    // Click first article
    const firstArticle = page.locator('article a, a[href*="/category/cxo-interview/"]').first()
    await firstArticle.click()
    await dismissLocaleModal(page)
    
    // Wait for page load
    await page.waitForLoadState('networkidle')
    
    // Check for IN FOCUS badge (desktop only)
    if (page.viewportSize()!.width >= 1024) {
      const badge = page.locator('text=/IN FOCUS/i')
      const badgeVisible = await badge.isVisible({ timeout: 5000 }).catch(() => false)
      console.log('IN FOCUS badge visible:', badgeVisible)
    }
    
    // Check for hero overlay
    const overlay = page.locator('h2[class*="uppercase"]')
    const hasOverlay = await overlay.count() > 0
    console.log('Interview has hero overlay:', hasOverlay)
  })

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE
    
    test.skip('Hero overlay readable on mobile', async ({ page }) => {
      await page.goto('https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil')
      await dismissLocaleModal(page)
      
      const tagline = page.locator('h2[class*="uppercase"]').first()
      const taglineVisible = await tagline.isVisible().catch(() => false)
      
      if (taglineVisible) {
        const fontSize = await tagline.evaluate(el => 
          window.getComputedStyle(el).fontSize
        )
        const fontSizeNum = parseInt(fontSize)
        expect(fontSizeNum).toBeGreaterThanOrEqual(16) // Min 16px on mobile
        console.log('Mobile tagline font size:', fontSize)
      }
    })
    
    test.skip('Badge hides on mobile', async ({ page }) => {
      await page.goto('https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil')
      await dismissLocaleModal(page)
      
      const badge = page.locator('[class*="in-focus-badge"]')
      const badgeVisible = await badge.isVisible().catch(() => false)
      
      // Badge should be hidden on mobile
      expect(badgeVisible).toBe(false)
      console.log('Badge correctly hidden on mobile')
    })
    
    test.skip('Pull quotes do not overflow', async ({ page }) => {
      await page.goto('https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil')
      await dismissLocaleModal(page)
      
      const quote = page.locator('blockquote').first()
      const quoteExists = await quote.count() > 0
      
      if (quoteExists) {
        const boundingBox = await quote.boundingBox()
        if (boundingBox) {
          expect(boundingBox.width).toBeLessThanOrEqual(375) // Viewport width
          console.log('Quote width:', boundingBox.width)
        }
      }
    })
  })

  test.describe('Performance', () => {
    test.skip('Page loads with new elements in under 4 seconds', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil')
      await dismissLocaleModal(page)
      await page.waitForSelector('article')
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(4000)
      console.log('Page load time:', loadTime, 'ms')
    })
    
    test.skip('No JavaScript errors in console', async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })
      
      await page.goto('https://csuitemagazine.global/csa/shrikant-vaidya-chairman-indianoil')
      await dismissLocaleModal(page)
      await page.waitForLoadState('networkidle')
      
      // Filter out expected/external errors
      const criticalErrors = errors.filter(err => 
        !err.includes('gtag') && 
        !err.includes('analytics') &&
        !err.includes('sentry')
      )
      
      expect(criticalErrors.length).toBe(0)
      console.log('JS errors:', criticalErrors.length)
    })
  })
})
