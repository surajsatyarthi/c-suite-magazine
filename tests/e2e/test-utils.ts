import { Page } from '@playwright/test';

/**
 * Dismisses the global EntryLocalePopup if it appears.
 * Handles "Not now" or "Continue" buttons.
 */
export async function dismissLocaleModal(page: Page) {
    try {
        // Look for any of the buttons that dismiss the modal
        const buttons = page.locator('button:has-text("Not now"), button:has-text("Continue"), .entry-locale-popup button');
        
        // Wait up to 3s for the modal to appear
        if (await buttons.first().isVisible({ timeout: 3000 }).catch(() => false)) {
            await buttons.first().click();
            // Wait for the modal backdrop/container to disappear
            await page.locator('.entry-locale-popup, [class*="locale-popup"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    } catch (e) {
        console.log('Locale modal not found or already dismissed');
    }
}
