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

/**
 * Checks if a document exists in Sanity with the given slug and type.
 * Useful for skipping E2E tests for drafts that aren't published.
 * 
 * @param client - Sanity client instance (usually pre-configured with perspective)
 * @param slug - The slug of the document to check
 * @param type - The Sanity document type (e.g. 'post', 'csa')
 * @param testRef - The Playwright 'test' object to call skip() on
 */
export async function skipIfMissing(client: any, slug: string, type: string, testRef: any) {
    const query = `*[_type == $type && slug.current == $slug][0]._id`;
    const docId = await client.fetch(query, { slug, type });
    
    if (!docId) {
        console.log(`[Dynamic Skip] Content "${slug}" (${type}) not found in Sanity. Skipping test suite.`);
        testRef.skip();
    }
}

/**
 * Centralized Discovery for E2E Tests
 * Handles finding valid, published content to avoid draft 404s.
 */
export class SanityDiscovery {
    private client: any;

    constructor(client: any) {
        this.client = client;
    }

    /**
     * Finds published slugs for a given type.
     */
    async getPublishedSlugs(type: string, limit: number = 3): Promise<string[]> {
        const query = `*[_type == $type && defined(slug.current)][0...$limit].slug.current`;
        const slugs = await this.client.fetch(query, { type, limit });
        return slugs || [];
    }

    /**
     * Finds articles that contain specific body block types (e.g., partnerQuotes).
     */
    async findWithFeature(type: string, featureType: string, limit: number = 1): Promise<string[]> {
        const query = `*[_type == $type && body[_type == $featureType]][0...$limit].slug.current`;
        const slugs = await this.client.fetch(query, { type, featureType, limit });
        return slugs || [];
    }

    /**
     * Finds CSAs that have ad-like images in the body.
     */
    async findCSAsWithAds(limit: number = 1): Promise<string[]> {
        const query = `*[_type == "csa" && body[_type == "image" && isPopupTrigger == false]][0...$limit].slug.current`;
        const slugs = await this.client.fetch(query, { limit });
        return slugs || [];
    }

    /**
     * Finds published categories.
     */
    async getCategories(limit: number = 3): Promise<string[]> {
        const query = `*[_type == "category" && defined(slug.current)][0...$limit].slug.current`;
        const slugs = await this.client.fetch(query, { limit });
        return slugs || [];
    }
}
