import { test, expect } from '@playwright/test';
import { dismissLocaleModal } from './test-utils';

/**
 * Post-deployment smoke tests
 * These run against production to verify critical paths work after deploy
 */

test.describe('Production Smoke Tests', () => {
    // baseURL is handled by playwright.config.ts or BASE_URL env var

    test('homepage loads without errors', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);

        // Check for critical elements
        await expect(page.locator('h1')).toBeVisible();
    });

    test('Leadership category loads', async ({ page }) => {
        const response = await page.goto('/category/leadership');
        expect(response?.status()).toBe(200);
    });

    test('CSA articles accessible', async ({ page }) => {
        // Increase timeout to 2 minutes for 3 articles with slow Postgres queries
        test.setTimeout(120000);
        
        // CSA articles use /csa/ route, not /category/
        // Only include verified PUBLISHED articles (not drafts)
        const csaSlugs = [
            '/csa/rich-stinson-ceo-southwire',
            '/csa/stella-ambrose-deputy-ceo-sawit-kinabalu',
            '/csa/sukhinder-singh-cassidy-rewiring-global-economy'
        ];

        for (const slug of csaSlugs) {
            // Use domcontentloaded to not wait for popups/modals
            const response = await page.goto(slug, { timeout: 60000, waitUntil: 'domcontentloaded' });
            expect(response?.status()).toBe(200);
            
            // Dismiss any country selector popup if present
            await dismissLocaleModal(page);
        }
    });

    test.skip('all 9 juggernaut articles accessible', async ({ page }) => {
        // Increase timeout to 3 minutes for 9 articles with slow Postgres queries
        test.setTimeout(180000);
        
        const juggernautSlugs = [
            '/category/cxo-interview/elon-musk-building-future-civilization-scale',
            '/category/cxo-interview/ratan-tata-legacy-ethical-leadership',
            '/category/cxo-interview/bhavesh-aggarwal-india-electric-ai-maverick',
            '/category/cxo-interview/ritesh-agarwal-billion-dollar-hostel-kid-rewrote-global-hospitality',
            '/category/cxo-interview/amin-nasser-steady-hand-guiding-energy-next-chapter',
            '/category/cxo-interview/chamath-palihapitiya-spac-king-climate-tech-rebel',
            '/category/cxo-interview/yi-he-village-roots-co-ceo-crypto-global-gateway',
            '/category/cxo-interview/mohamed-alabbar-dubai-master-builder-urban-innovation',
            '/category/cxo-interview/murray-auchincloss-pragmatic-reset-steering-bp-value'
        ];

        for (const slug of juggernautSlugs) {
            const response = await page.goto(slug, { timeout: 60000 });
            expect(response?.status()).toBe(200);
        }
    });

    test('spotlight config rendering', async ({ page }) => {
        await page.goto('/');

        // Check hero section exists (spotlight hero is the first main article)
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
