import { test, expect } from "@playwright/test";
import { dismissLocaleModal, SanityDiscovery } from "./test-utils";
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

test.describe("CSA Content - Dynamic Ad & Integration Tests", () => {
  let articleSlug: string | null = null;
  let articleData: any = null;

  test.beforeAll(async () => {
    // Dynamically find a CSA with ads
    const slugs = await discovery.findCSAsWithAds(1);
    
    if (slugs.length === 0) {
        console.log('[Skip] No CSAs with valid ad images found for verification.');
        test.skip();
        return;
    }

    articleSlug = slugs[0];

    // Fetch full data for the discovered article
    const query = `*[_type == "csa" && slug.current == $slug][0] {
      title,
      "adImages": body[_type == "image" && isPopupTrigger == false].asset->url,
      "partnerQuotes": body[_type == "partnerQuotes"].quotes[] {
        company,
        "logoUrl": logo.asset->url
      }
    }`;

    articleData = await client.fetch(query, { slug: articleSlug });
  });

  test.beforeEach(async ({ page }) => {
    if (!articleSlug) return;
    await page.goto(`/csa/${articleSlug}`);
    await dismissLocaleModal(page);
  });

  test("should dynamically verify all configured ad images", async ({ page }) => {
    if (!articleData) return;

    console.log(`[Data] Verifying ads for article: "${articleData.title}"`);
    
    // Check if we have any images to verify
    if (!articleData.adImages || articleData.adImages.length === 0) {
      console.log("[Info] No ad images configured for this article.");
      return;
    }

    for (const imageUrl of articleData.adImages) {
        // Find by partial src as Sanity URLs are long but unique
        const fileName = imageUrl.split('/').pop()?.split('-')[1]; 
        const adImage = page.locator(`img[src*="${fileName}"]`);
        
        await expect(adImage.first()).toBeVisible({ timeout: 15000 });
        console.log(`✅ Verified image: ${fileName}`);
    }
  });

  test("should verify partner logos in quotes section", async ({ page }) => {
    if (!articleData?.partnerQuotes) return;

    const quotes = articleData.partnerQuotes;
    console.log(`[Data] Verifying ${quotes.length} partner logos`);

    for (const quote of quotes) {
        if (!quote.logoUrl) continue;

        const logoFileName = quote.logoUrl.split('/').pop()?.split('-')[1];
        const logoImg = page.locator(`img[src*="${logoFileName}"]`);
        
        // Logos might be further down, scroll to them
        await logoImg.first().scrollIntoViewIfNeeded();
        await expect(logoImg.first()).toBeVisible();
        console.log(`✅ Verified partner logo for: ${quote.company}`);
    }
  });
});
