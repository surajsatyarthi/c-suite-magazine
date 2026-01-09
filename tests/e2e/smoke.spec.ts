import { test, expect } from '@playwright/test';

/**
 * Post-deployment smoke tests
 * These run against production to verify critical paths work after deploy
 */

const PRODUCTION_URL = 'https://csuitemagazine.global';

test.describe('Production Smoke Tests', () => {
    test.use({ baseURL: PRODUCTION_URL });

    test('homepage loads without errors', async ({ page }) => {
        const response = await page.goto('/');
        expect(response?.status()).toBe(200);

        // Check for critical elements
        await expect(page.locator('h1')).toBeVisible();
    });

    test('CXO Interview category loads', async ({ page }) => {
        const response = await page.goto('/category/cxo-interview');
        expect(response?.status()).toBe(200);
    });

    test('CSA articles accessible', async ({ page }) => {
        // Test all 3 CSA articles load
        const csaSlugs = [
            '/category/cxo-interview/rich-stinson-ceo-southwire',
            '/category/cxo-interview/stella-ambrose-deputy-ceo-sawit-kinabalu',
            '/category/cxo-interview/shrikant-vaidya-chairman-indianoil'
        ];

        for (const slug of csaSlugs) {
            const response = await page.goto(slug);
            expect(response?.status()).toBe(200);
        }
    });

    test('all 9 juggernaut articles accessible', async ({ page }) => {
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
            const response = await page.goto(slug);
            expect(response?.status()).toBe(200);
        }
    });

    test('spotlight config rendering', async ({ page }) => {
        await page.goto('/');

        // Check spotlight section exists
        const spotlight = page.locator('[class*="spotlight"]').first();
        await expect(spotlight).toBeVisible({ timeout: 10000 });
    });

    test('no 404 errors on critical paths', async ({ page }) => {
        const criticalPaths = [
            '/',
            '/category/cxo-interview',
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
