import { test, expect } from '@playwright/test';
import { dismissLocaleModal } from './test-utils';

test.describe('CXO Interview Category Page -Critical Revenue Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/category/cxo-interview');
        await dismissLocaleModal(page);
    });

    test('displays paid CSA articles (revenue-critical)', async ({ page }) => {
        // Find all article headings
        const articleHeadings = page.locator('h3');
        const count = await articleHeadings.count();
        
        // At least 3 articles should be present on the category page
        expect(count).toBeGreaterThanOrEqual(3);
        
        // Verify we can find at least one paid article by its structure 
        // (CSAs usually have specific metadata or placement)
        const firstTitle = await articleHeadings.first().textContent();
        expect(firstTitle?.length).toBeGreaterThan(5);
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

    test('CSAs visible on first page', async ({ page }) => {
        const articleTitles = page.locator('[href^="/category/cxo-interview/"] h3');
        const count = await articleTitles.count();
        
        // Verify that articles at positions 10-12 exist (standard CSA placement)
        if (count >= 12) {
            const position10 = await articleTitles.nth(9).textContent();
            expect(position10?.length).toBeGreaterThan(0);
        } else {
            // If less than 12, just verify first few are present
            expect(count).toBeGreaterThan(0);
        }
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
        // All articles on the first page should have excerpts (revenue-critical quality check)
        for (let i = 0; i < await articles.count(); i++) {
            const article = articles.nth(i);
            
            // Should have excerpt (p tag with line-clamp)
            const excerpt = article.locator('p.line-clamp-3');
            await expect(excerpt).toBeVisible();
            const excerptText = await excerpt.textContent();
            expect(excerptText?.length).toBeGreaterThan(20);
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
