import { test, expect } from '@playwright/test';

test.describe('CXO Interview Category Page -Critical Revenue Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/category/cxo-interview');
    });

    test('displays all 3 CSA articles (revenue-critical)', async ({ page }) => {
        // These are paid articles - MUST be visible
        const richStinson = page.getByRole('heading', { name: /Rich Stinson/i });
        const stellaAmbrose = page.getByRole('heading', { name: /Stella Ambrose/i });
        const shrikantVaidya = page.getByRole('heading', { name: /Shrikant.*Vaidya/i });

        await expect(richStinson).toBeVisible({ timeout: 10000 });
        await expect(stellaAmbrose).toBeVisible({ timeout: 10000 });
        await expect(shrikantVaidya).toBeVisible({ timeout: 10000 });
    });

    test('displays exactly 21 articles on page 1', async ({ page }) => {
        // Count article cards
        const articles = page.locator('[href^="/category/cxo-interview/"]').filter({
            has: page.locator('h3')
        });

        const count = await articles.count();
        expect(count).toBe(21);
    });

    test('pagination UI renders for 2 pages', async ({ page }) => {
        // Should have pagination navigation
        const pagination = page.getByRole('navigation', { name: 'Pagination' });
        await expect(pagination).toBeVisible();

        // Should have page 2 button
        const page2Button = page.getByRole('button', { name: 'Page 2' });
        await expect(page2Button).toBeVisible();
    });

    test('industry juggernauts appear first (positions 1-9)', async ({ page }) => {
        const expectedJuggernauts = [
            /Elon Musk/i,
            /Ratan Tata/i,
            /Bhavesh Aggarwal/i,
            /Ritesh Agarwal/i,
            /Amin.*Nasser/i,
            /Chamath Palihapitiya/i,
            /Yi He/i,
            /Mohamed Alabbar/i,
            /Murray Auchincloss/i
        ];

        // Get first 9 article titles
        const articleTitles = page.locator('[href^="/category/cxo-interview/"] h3');

        for (let i = 0; i < expectedJuggernauts.length; i++) {
            const titleText = await articleTitles.nth(i).textContent();
            expect(titleText).toMatch(expectedJuggernauts[i]);
        }
    });

    test('CSAs visible on first page (positions 10-12)', async ({ page }) => {
        // CSAs should be positions 10-12 (right after juggernauts)
        const articleTitles = page.locator('[href^="/category/cxo-interview/"] h3');

        const position10 = await articleTitles.nth(9).textContent();
        const position11 = await articleTitles.nth(10).textContent();
        const position12 = await articleTitles.nth(11).textContent();

        // One of these should be a CSA
        const csaNames = ['Rich Stinson', 'Stella Ambrose', 'Shrikant', 'Vaidya'];
        const hasCsa10 = csaNames.some(name => position10?.includes(name));
        const hasCsa11 = csaNames.some(name => position11?.includes(name));
        const hasCsa12 = csaNames.some(name => position12?.includes(name));

        // At least one CSA in positions 10-12
        expect(hasCsa10 || hasCsa11 || hasCsa12).toBeTruthy();
    });

    test('pagination navigation works', async ({ page }) => {
        // Click page 2
        await page.getByRole('button', { name: 'Page 2' }).click();

        // Wait for URL to update
        await page.waitForURL('**/category/cxo-interview#page=2');

        // Should have articles on page 2
        const articles = page.locator('[href^="/category/cxo-interview/"]').filter({
            has: page.locator('h3')
        });

        const count = await articles.count();
        expect(count).toBeGreaterThan(0);
    });

    test('all CSA articles have excerpts', async ({ page }) => {
        // Get all article cards
        const articles = page.locator('[href^="/category/cxo-interview/"]');

        // Find CSA articles
        for (let i = 0; i < await articles.count(); i++) {
            const article = articles.nth(i);
            const title = await article.locator('h3').textContent();

            // Check if it's a CSA
            if (title && (
                title.includes('Rich Stinson') ||
                title.includes('Stella Ambrose') ||
                title.includes('Shrikant') ||
                title.includes('Vaidya')
            )) {
                // CSA should have excerpt (p tag with text)
                const excerpt = article.locator('p.line-clamp-3');
                await expect(excerpt).toBeVisible();
                const excerptText = await excerpt.textContent();
                expect(excerptText?.length).toBeGreaterThan(20);
            }
        }
    });

    test('no console errors on category page', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/category/cxo-interview');
        await page.waitForLoadState('networkidle');

        // Filter out known acceptable errors
        const criticalErrors = errors.filter(err =>
            !err.includes('favicon') &&
            !err.includes('analytics')
        );

        expect(criticalErrors).toHaveLength(0);
    });
});
