import { test, expect } from "@playwright/test";
import { createClient } from "next-sanity";
import { SanityDiscovery, dismissLocaleModal } from "./test-utils";

// Initialize Sanity Client for Discovery
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
});

const discovery = new SanityDiscovery(client);

test.describe("Tag Landing Pages (Issue #9)", () => {
    
  test("should display the Tag Index page", async ({ page }) => {
    await page.goto("/tag");
    await dismissLocaleModal(page);
    await expect(page).toHaveTitle(/Industry Tags/i);
    await expect(page.getByRole("heading", { name: "Industry Topics" })).toBeVisible();
    // Should have some tags
    const links = page.locator('a[href^="/tag/"]');
    await expect(links.first()).toBeVisible();
  });

  test("should display a dynamic Tag Landing Page", async ({ page }) => {
    // 1. Discover a real tag
    const tags = await discovery.getTags(1);
    if (tags.length === 0) {
        test.skip(true, "No tags found in CMS to test");
        return;
    }
    const safeTag = tags[0]; // e.g. "Leadership"
    // Normalize logic: slugify it
    const slug = safeTag.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    
    // console.log(`Testing Tag: ${safeTag} -> /tag/${slug}`);

    // 2. Visit the page
    await page.goto(`/tag/${slug}`);
    await dismissLocaleModal(page);

    // 3. Verify Header
    // Title is usually "Leadership" (First char capped)
    // We check partial match for the tag name
    await expect(page.locator('h1')).toContainText(safeTag, { ignoreCase: true });

    // 4. Verify Articles
    const articles = page.locator('article, .group'); // .group is the card class
    await expect(articles.first()).toBeVisible();
  });


  test("Visual Regression: Luxury Tag Page", async ({ page }) => {
    await page.goto("/tag/luxury");
    
    // Force hide country selector modal if present (robustness)
    await page.addStyleTag({ content: `[role="dialog"] { display: none !important; }` });
    
    await dismissLocaleModal(page);
    await expect(page.locator("h1")).toContainText("Luxury");
    await page.evaluate(() => document.fonts.ready);
    
    const { visualExpect } = require('./utils/visual');
    await visualExpect(page, 'tag-page-luxury.png', {
      mask: [page.locator('.ad-slot')], 
      maxDiffPixels: 3000 // Increased tolerance for gradient/rendering diffs
    });
  });

  test("should redirect Uppercase URLs to Lowercase (Middleware)", async ({ page }) => {
    const capsUrl = "/tag/LEADERSHIP";
    await page.goto(capsUrl);
    await expect(page).toHaveURL(/\/tag\/leadership/);
  });
});
