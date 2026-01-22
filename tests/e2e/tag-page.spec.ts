import { test, expect } from "@playwright/test";

test.describe("Tag Index Page (Issue #28)", () => {
  test("should load the tag index and display tags", async ({ page }) => {
    // 1. Visit the page
    await page.goto("/tag");

    // 2. Verified Title
    await expect(page).toHaveTitle(/Industry Tags | C-Suite Magazine/);

    // 3. Verify Header
    await expect(page.getByRole("heading", { name: "Industry Topics" })).toBeVisible();

    // 4. Verify Content (Tags)
    // We expect at least some tag groups (A, B, C or #)
    const tagGroups = page.locator("h2.text-2xl");
    await expect(tagGroups.first()).toBeVisible();
    
    // Check for a specific known tag link structure
    const tagLinks = page.locator('a[href^="/tag/"]');
    await expect(tagLinks.first()).toBeVisible();
    
    const count = await tagLinks.count();
    console.log(`Found ${count} tag links.`);
    expect(count).toBeGreaterThan(5); // We expect plenty of tags
  });
});
