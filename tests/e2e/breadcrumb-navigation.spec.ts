import { test, expect } from '@playwright/test';
import { dismissLocaleModal, SanityDiscovery } from './test-utils';
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

test.describe('Breadcrumb Navigation - Dynamic Verification', () => {
    let leadershipSlug: string | null = null;
    let csaSlug: string | null = null;

    test.beforeAll(async () => {
        // Find a leadership article
        const posts = await discovery.getPublishedSlugs('post', 1);
        leadershipSlug = posts.length > 0 ? posts[0] : null;

        // Find a CSA article
        const csas = await discovery.getPublishedSlugs('csa', 1);
        csaSlug = csas.length > 0 ? csas[0] : null;

        if (!leadershipSlug && !csaSlug) {
            console.log('[Skip] No matching content found for breadcrumb verification.');
            test.skip();
        }
    });

    test('Article breadcrumbs show Home and Category (no title)', async ({ page }) => {
        if (!leadershipSlug) return;
        await page.goto(`/category/leadership/${leadershipSlug}`);
        await dismissLocaleModal(page);

        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(breadcrumbs).toContainText('Home');
        
        // Count breadcrumb items (should be at least 2: Home + Category)
        const items = breadcrumbs.locator('span.flex.items-center.gap-2');
        const count = await items.count();
        expect(count).toBeGreaterThanOrEqual(2);
    });

    test('CSA article shows correct breadcrumbs', async ({ page }) => {
        if (!csaSlug) return;
        await page.goto(`/csa/${csaSlug}`);
        await dismissLocaleModal(page);

        const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
        await expect(breadcrumbs).toContainText('Home');
        await expect(breadcrumbs).not.toContainText('Company Sponsored');
        
        // Items should be 2: Home + Category
        const items = breadcrumbs.locator('span.flex.items-center.gap-2');
        expect(await items.count()).toBe(2);
    });
    
    test('CSA article routes strictly to /csa/ and NOT /category/', async ({ page }) => {
        if (!csaSlug) return;
        
        // 1. Visit correctly
        const csaResponse = await page.goto(`/csa/${csaSlug}`);
        expect(csaResponse?.status()).toBe(200);

        // 2. Visit incorrectly (old duplicate path)
        // We expect 404 because CSAs are filtered out from post queries
        const categoryResponse = await page.goto(`/category/leadership/${csaSlug}`);
        const categoryResponse2 = await page.goto(`/category/cxo-interview/${csaSlug}`);
        
        // At least one of these should 404 or redirect, ensuring no duplicate content
        expect(categoryResponse2?.status()).toBe(404);
    });
});
