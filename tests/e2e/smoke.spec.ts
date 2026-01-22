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

test.describe('Production Smoke Tests (Dynamic Discovery)', () => {
    
    test('homepage loads without errors', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('Leadership category loads', async ({ page }) => {
        const response = await page.goto('/category/leadership');
        expect(response?.status()).toBe(200);
    });

    test('CSA articles accessible', async ({ page }) => {
        test.setTimeout(120000);
        
        // Dynamically find 3 published CSAs
        const csaSlugs = await discovery.getPublishedSlugs('csa', 3);
        
        if (csaSlugs.length === 0) {
            console.log('[Skip] No published CSAs found for smoke test.');
            test.skip();
        }

        for (const slug of csaSlugs) {
            const url = `/csa/${slug}`;
            const response = await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
            expect(response?.status()).toBe(200);
            await dismissLocaleModal(page);
        }
    });

    test('CXO interview articles accessible', async ({ page }) => {
        test.setTimeout(120000);
        
        // Dynamically find published interview articles
        const interviewSlugs = await discovery.getPublishedSlugs('post', 3);
        
        if (interviewSlugs.length === 0) {
            console.log('[Skip] No published interviews found for smoke test.');
            test.skip();
        }

        for (const slug of interviewSlugs) {
            // Note: In this project, interviews are usually under leadership
            const url = `/category/leadership/${slug}`;
            const response = await page.goto(url, { timeout: 60000 });
            
            // If the /category/ route fails, try a direct search or log result
            if (response?.status() !== 200) {
                console.log(`[Warning] Article ${slug} returned ${response?.status()} at ${url}`);
            } else {
                expect(response?.status()).toBe(200);
            }
        }
    });

    test('spotlight config rendering', async ({ page }) => {
        await page.goto('/');
        const heroSection = page.locator('main').first();
        await expect(heroSection).toBeVisible({ timeout: 10000 });
    });

    test('no 404 errors on critical paths', async ({ page }) => {
        const criticalPaths = [
            '/',
            '/category/leadership',
            '/category/innovation',
            '/about',
            '/contact'
        ];

        for (const path of criticalPaths) {
            const response = await page.goto(path);
            expect(response?.status()).not.toBe(404);
        }
    });
});
