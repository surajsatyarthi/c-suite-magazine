import { test, expect } from '@playwright/test'

test.describe('Category Scroll Management', () => {
  
  test('should unlock body scroll after dismissing popup and navigating', async ({ page }) => {
    // 1. Visit Homepage (Locale popup triggers)
    await page.goto('/')
    
    // 2. Wait for Locale Popup and verify lock
    const popup = page.locator('.entry-locale-popup')
    await expect(popup).toBeVisible({ timeout: 10000 })
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
    
    // 3. Dismiss Popup ("Not now")
    await page.getByRole('button', { name: 'Not now' }).click()
    await expect(popup).not.toBeVisible()
    
    // 4. Verify Body is Unlocked
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')

    // 5. Navigate to a Category Page (Standard User Flow)
    // This verifies that navigation doesn't accidentally re-lock or "freeze"
    await page.goto('/category/leadership')
    
    // 6. Verify Body is STILL Unlocked on new page
    // Since we dismissed it, it should stay dismissed (sessionStorage).
    // The previous bug was "Scroll Freeze on Category Pages".
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    
    // Also verify popup didn't come back (Gatekeeper logic obeyed)
    await expect(popup).not.toBeVisible()
  })

})
