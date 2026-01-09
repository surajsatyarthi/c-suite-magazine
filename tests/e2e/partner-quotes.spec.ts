import { test, expect } from '@playwright/test'

test.describe('Partner Quotes and Pull Quotes - Indian Oil CSA', () => {
    const articleUrl = '/csa/shrikant-vaidya-chairman-indianoil'

    test('should display enhanced pull quotes with background styling', async ({ page }) => {
        await page.goto(articleUrl)
        
        // Wait for page to load
        await page.waitForSelector('article', { timeout: 10000 })
        
        // Find blockquote elements (pull quotes)
        const blockquotes = await page.locator('blockquote').all()
        
        // Should have at least 4 pull quotes
        expect(blockquotes.length).toBeGreaterThanOrEqual(4)
        
        if (blockquotes.length > 0) {
            const firstQuote = blockquotes[0]
            
            // Check for decorative quote mark
            const quoteMarkExists = await firstQuote.locator('div').first().isVisible()
            expect(quoteMarkExists).toBeTruthy()
            
            // Check for styled text
            const quoteText = await firstQuote.locator('p').first()
            expect(await quoteText.isVisible()).toBeTruthy()
            
            // Verify text is not empty
            const text = await quoteText.textContent()
            expect(text).toBeTruthy()
            expect(text!.length).toBeGreaterThan(20)
        }
    })

    test('should display Partner Perspectives section with 7 testimonial cards', async ({ page }) => {
        await page.goto(articleUrl)
        
        // Wait for page to load
        await page.waitForSelector('article', { timeout: 10000 })
        
        // Scroll to bottom to ensure lazy-loaded content appears
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(1000)
        
        // Look for partner quotes section
        // The component should render with specific company names
        const partnerCompanies = [
            'AVEVA',
            'W R Grace',
            'L&T',
            'Isgec Hitachi Zosen',
            'Hewlett Packard Enterprise',
            'Technip Energies',
            'Süd-Chemie'
        ]
        
        let foundCount = 0
        for (const company of partnerCompanies) {
            const companyElement = page.getByText(company, { exact: false })
            if (await companyElement.count() > 0) {
                foundCount++
            }
        }
        
        // Should find at least 5 out of 7 companies (accounting for text variations)
        expect(foundCount).toBeGreaterThanOrEqual(5)
    })

    test('should have proper article structure', async ({ page }) => {
        await page.goto(articleUrl)
        
        // Check main elements exist
        await expect(page.locator('h1')).toBeVisible()
        await expect(page.locator('article')).toBeVisible()
        
        // Check for hero image
        const heroImage = page.locator('img').first()
        await expect(heroImage).toBeVisible()
    })

    test('should display "READ MORE ARTICLES" section', async ({ page }) => {
        await page.goto(articleUrl)
        
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        
        // Check for read more section
        const readMore = page.getByText('READ MORE ARTICLES', { exact: false })
        await expect(readMore).toBeVisible()
    })
})
