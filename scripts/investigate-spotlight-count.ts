import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function investigateSpotlightDiscrepancy() {
    console.log('🔍 Investigating Spotlight Article Discrepancy\n');
    console.log('Expected: 12 on homepage');
    console.log('Sanity has: 15 items\n');
    console.log('='.repeat(100));

    try {
        // Get spotlight config
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0] {
            _id,
            cardCount,
            items[]-> {
                _id,
                title,
                slug
            }
        }`);

        console.log('\n📊 Sanity Configuration:');
        console.log(`   cardCount setting: ${spotlight.cardCount || 'not set'}`);
        console.log(`   Total items in array: ${spotlight.items.length}\n`);

        console.log('📋 All Items in spotlightConfig.items:\n');
        spotlight.items.forEach((item: any, i: number) => {
            console.log(`   ${i + 1}. ${item?.title || 'NULL/DELETED'} (${item?._id || 'N/A'})`);
        });

        // Check environment variable
        console.log('\n🔧 Frontend Configuration:');
        console.log(`   NEXT_PUBLIC_SPOTLIGHT_COUNT: ${process.env.NEXT_PUBLIC_SPOTLIGHT_COUNT || 'not set'}\n`);

        // Check for Rich Stinson
        const richStinson = spotlight.items.find((item: any) => item?.title?.includes('Rich Stinson'));
        if (richStinson) {
            console.log('👤 Rich Stinson Found:');
            console.log(`   Title: ${richStinson.title}`);
            console.log('   Status: Will be filtered out for "Executive in Focus" section\n');
        }

        // Calculate what would display
        const gridItems = spotlight.items.filter((item: any) =>
            item !== null && !item?.title?.includes('Rich Stinson')
        );

        console.log('📐 Display Logic (from lib/spotlight.ts):');
        console.log(`   1. Filter out Rich Stinson (if present): ${spotlight.items.length} → ${gridItems.length}`);

        const maxCount = spotlight.cardCount || parseInt(process.env.NEXT_PUBLIC_SPOTLIGHT_COUNT || '12', 10) || 12;
        console.log(`   2. Apply maxCount limit: ${maxCount}`);
        console.log(`   3. Result: ${Math.min(gridItems.length, maxCount)} articles will display\n`);

        console.log('='.repeat(100));
        console.log('\n🎯 FINDINGS:\n');

        if (gridItems.length > maxCount) {
            console.log(`   ⚠️  MISMATCH DETECTED!`);
            console.log(`   Sanity has ${gridItems.length} grid items (after filtering Rich Stinson)`);
            console.log(`   But cardCount/config limits display to ${maxCount}`);
            console.log(`\n   Missing ${gridItems.length - maxCount} articles from homepage:\n`);

            gridItems.slice(maxCount).forEach((item: any, i: number) => {
                console.log(`   ${i + 1}. ${item.title}`);
            });
        } else if (gridItems.length < maxCount) {
            console.log(`   Not enough articles! Have ${gridItems.length}, configured for ${maxCount}`);
        } else {
            console.log(`   ✅ Perfect match! ${gridItems.length} articles, displaying ${maxCount}`);
        }

        console.log('\n💡 SOLUTION:\n');
        if (gridItems.length > maxCount) {
            console.log(`   Option 1: Update cardCount in Sanity to ${gridItems.length}`);
            console.log(`   Option 2: Remove ${gridItems.length - maxCount} article(s) from spotlightConfig.items`);
        }
        console.log('\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

investigateSpotlightDiscrepancy();
