import { test, expect } from '@playwright/test'
import { dismissLocaleModal, SanityDiscovery } from './test-utils'
import { createClient } from "next-sanity";
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: process.env.SANITY_VIEW_DRAFTS === "true" ? "previewDrafts" : "published",
});

const discovery = new SanityDiscovery(client);

test.describe('Partner Quotes - Dynamic Content Verification', () => {
    let articleSlug: string | null = null;
    let partnerData: any[] = [];
    
    test.beforeAll(async () => {
        // Find an article (post or csa) that has partnerQuotes
        const slugs = await discovery.findWithFeature('csa', 'partnerQuotes', 1);
        
        if (slugs.length === 0) {
            console.log('[Skip] No published articles with partner quotes found.');
            test.skip();
            return;
        }

        articleSlug = slugs[0];

        // Fetch the specific partner names from the discovered article
        const query = `*[_type == "csa" && slug.current == $slug][0].body[_type == "partnerQuotes"].quotes[] {
            company
        }`;
        
        partnerData = await client.fetch(query, { slug: articleSlug });
    });

    test.beforeEach(async ({ page }) => {
        if (!articleSlug) return;
        await page.goto(`/csa/${articleSlug}`);
        await dismissLocaleModal(page);
    });

    test('should display Partner Perspectives section with actual data', async ({ page }) => {
        await page.waitForSelector('article', { timeout: 10000 });
        
        // Scroll to ensure content loads
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
        
        // Look for the "Partner Perspectives" section header
        const header = page.getByText('Partner Perspectives', { exact: false });
        await expect(header).toBeVisible();

        // Verify that the companies found in Sanity are actually on the page
        if (partnerData && partnerData.length > 0) {
            for (const quote of partnerData.slice(0, 3)) { // Check top 3 to keep test fast
                if (quote.company) {
                    const companyElement = page.getByText(quote.company, { exact: false }).first();
                    await expect(companyElement).toBeVisible();
                    console.log(`✅ Verified partner: ${quote.company}`);
                }
            }
        }
    });

    test('should have proper pull quote styling', async ({ page }) => {
        const blockquotes = page.locator('blockquote');
        const count = await blockquotes.count();
        
        if (count > 0) {
            const firstQuote = blockquotes.first();
            await expect(firstQuote).toBeVisible();
            
            const textAlign = await firstQuote.evaluate(el => window.getComputedStyle(el).textAlign);
            // Most pull quotes are centered in the new design
            expect(textAlign).toBe('center');
        }
    });
});
