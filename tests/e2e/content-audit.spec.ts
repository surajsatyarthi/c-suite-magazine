import { test, expect } from '@playwright/test';

test('UI Content Audit: Broken Images and Missing Excerpts', async ({ page }) => {
    console.log('\n--- Starting UI Content Audit ---');
    
    // 1. Audit Homepage
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');
    // Handle locale modal if present
    await page.locator('button:has-text("Not now")').click().catch(() => {});
    // Handle ad modal if present
    await page.locator('button[aria-label="Close ad"]').click().catch(() => {});

    console.log(`Auditing Homepage...`);
    const resultHome = await auditPageContent(page);
    
    console.log(`Homepage Results:`);
    console.log(`- Total Articles Found: ${resultHome.headingCount}`);
    console.log(`- Broken Images (failed to load): ${resultHome.brokenImages}`);
    console.log(`- Placeholder Images (missing data): ${resultHome.placeholders}`);
    console.log(`- Articles Missing Excerpts: ${resultHome.missingExcerpts}`);

    // 2. Audit Main Category Pages
    const categories = [
        '/category/leadership',
        '/category/cxo-interview',
        '/category/innovation'
    ];

    for (const cat of categories) {
        console.log(`\nAuditing ${cat}...`);
        try {
            await page.goto(`http://localhost:3000${cat}`, { timeout: 30000 });
            await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
            // Handle ad modal on categories too (just in case)
            await page.locator('button[aria-label="Close ad"]').click({ timeout: 2000 }).catch(() => {});
            const result = await auditPageContent(page);
            console.log(`${cat} Results:`);
            console.log(`- Total Articles Found: ${result.headingCount}`);
            console.log(`- Broken Images: ${result.brokenImages}`);
            console.log(`- Placeholder Images: ${result.placeholders}`);
            console.log(`- Articles Missing Excerpts: ${result.missingExcerpts}`);
        } catch (e) {
            console.log(`[WARN] Failed to audit category ${cat}: ${e.message}`);
        }
    }

    console.log('\n--- UI Audit Complete ---');
});

async function auditPageContent(page) {
    // Scroll to bottom to trigger lazy loading
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 300;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve(true);
                }
            }, 50); // Fast scroll
        });
        // Wait a bit for images to decode
        await new Promise(r => setTimeout(r, 1000));
    });

    return await page.evaluate(async () => {
        const results = {
            brokenImages: 0,
            placeholders: 0,
            missingExcerpts: 0,
            headingCount: 0
        };

        // 1. Audit Images within Main Content
        // Target article images specifically
        const images = Array.from(document.querySelectorAll('main img'));
        for (const img of images) {
            // Skip small icons/avatars (heuristic: width < 50)
            if (img.clientWidth < 50 || img.clientHeight < 50) continue;

            const isBroken = !img.complete || img.naturalWidth === 0;
            const imgSrc = img.getAttribute('src');
            
            if (isBroken) {
                // Ignore tracking pixels or tiny images
                if (imgSrc && !imgSrc.includes('data:image/gif')) {
                    results.brokenImages++;
                    console.log(`[Browser Audit] Broken Image: ${img.alt || 'No Alt'} src=${imgSrc}`);
                }
            } else {
                // Detect placeholder by src content if applicable (e.g. placeholder.svg)
                if (imgSrc && imgSrc.includes('placeholder')) {
                    results.placeholders++;
                }
            }
        }

        // 2. Audit Excerpts
        // Look for article cards - typically have an h3/h4 and should have a p sibling or cousin
        const headings = Array.from(document.querySelectorAll('main h3, main h4'));
        results.headingCount = headings.length;

        for (const heading of headings) {
            const title = heading.innerText.trim();
            if (!title) continue;

            // Heuristic: Article cards usually have text. Section headers might not.
            // Look for a paragraph in the parent or grandparent container
            let parent = heading.parentElement;
            let foundP = false;
            
            // Traverse up 2 levels max to find a container with a paragraph
            for (let i = 0; i < 3; i++) {
                if (!parent) break;
                const p = parent.querySelector('p');
                if (p && p.innerText.trim().length > 0) {
                    foundP = true;
                    break;
                }
                parent = parent.parentElement;
            }

            // Exclude common section headers based on known text
            if (/^(Latest Insights|Executive in Focus|Guest Authors|Industry Juggernauts|Magazine Archive|Executive Compensation)/i.test(title)) {
                continue;
            }

            if (!foundP) {
                // Strictly for article-looking things. 
                // Check if this heading is inside an Article tag or looks like a card
                const closestArticle = heading.closest('article');
                const closestGroup = heading.closest('.group');
                
                if (closestArticle || closestGroup) {
                    results.missingExcerpts++;
                    console.log(`[Browser Audit] Missing Excerpt for: ${title}`);
                }
            }
        }

        return results;
    });
}
