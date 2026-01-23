
import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Sanity Client (Direct, no Next.js deps)
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false, // Always fetch fresh data
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

async function verifySpotlightIntegrity() {
    console.log('🕵️‍♂️ Ralph Protocol: Verifying Spotlight Overlays (Issue #3)...\n');

    try {
        // 1. Fetch the OFFICIAL spotlight config (The 12 items)
        // We explicitly dereference items to check the fields on the ACTUAL document
        const config = await client.fetch(`
            *[_type == "spotlightConfig"] | order(_updatedAt desc)[0] {
                items[]->{
                    _id,
                    title,
                    "spotlightImage": spotlightImage.asset,
                    "mainImage": mainImage.asset
                }
            }
        `);

        if (!config || !config.items || config.items.length === 0) {
            console.error('❌ FATAL: No Spotlight Config or Items found!');
            process.exit(1);
        }

        const items = config.items;
        console.log(`📋 Found ${items.length} Spotlight Items (Target: 12)\n`);

        let passCount = 0;
        let failCount = 0;

        console.log('| Status | Article Title | Spotlight Image | Main Image (Fallback) |');
        console.log('| :--- | :--- | :--- | :--- |');

        for (const item of items) {
            if (!item) continue; // Skip null refs

            const hasSpotlight = !!item.spotlightImage;
            const hasMain = !!item.mainImage;
            
            const statusIcon = hasSpotlight ? '✅' : '❌';
            const spotlightStatus = hasSpotlight ? 'PRESENT' : 'MISSING';
            const mainStatus = hasMain ? 'Present' : 'Missing';

            console.log(`| ${statusIcon} | ${item.title.padEnd(30).substring(0, 30)} | ${spotlightStatus.padEnd(10)} | ${mainStatus} |`);

            if (hasSpotlight) {
                passCount++;
            } else {
                failCount++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`RESULTS: ${passCount} Passed, ${failCount} Failed`);
        
        if (failCount > 0) {
            console.error(`\n🚨 FAIL: ${failCount} articles are missing the required 'spotlightImage' overlay.`);
            process.exit(1);
        } else {
            console.log(`\n🎉 SUCCESS: All ${passCount} spotlight articles have verified overlays.`);
            process.exit(0);
        }

    } catch (error) {
        console.error('💥 Execution Error:', error);
        process.exit(1);
    }
}

verifySpotlightIntegrity();
