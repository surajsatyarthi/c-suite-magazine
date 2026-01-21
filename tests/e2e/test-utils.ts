import { Page } from '@playwright/test';

/**
 * Dismisses the global EntryLocalePopup if it appears.
 * Handles "Not now" or "Continue" buttons.
 */
export async function dismissLocaleModal(page: Page) {
    try {
        const modal = page.locator('.entry-locale-popup');
        const notNowButton = page.locator('button:has-text("Not now")');
        
        // Wait a short time for modal to potentially appear
        if (await notNowButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await notNowButton.click();
            // Wait for modal to disappear
            await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    } catch (e) {
        // Ignore errors if modal doesn't appear or dismissal fails
        console.log('Locale modal not found or already dismissed');
    }
}
