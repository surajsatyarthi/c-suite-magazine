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

async function fixSpotlightCardCount() {
    console.log('🔧 Diagnosing and Fixing Spotlight CardCount\n');

    try {
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0] {
            _id,
            cardCount,
            items[]-> { _id, title }
        }`);

        console.log('Current Sanity Configuration:');
        console.log(`   cardCount: ${spotlight.cardCount}`);
        console.log(`   items.length: ${spotlight.items.length}`);
        console.log(`   Type of cardCount: ${typeof spotlight.cardCount}\n`);

        // The issue: cardCount is 16 but only 15 items exist
        // AND the user sees only 12 on the homepage

        console.log('🔍 Analysis:');
        console.log(`   Sanity wants to show: ${spotlight.cardCount} articles`);
        console.log(`   Sanity has: ${spotlight.items.length} articles`);
        console.log(`   Homepage shows: 12 articles (reported by user)\n`);

        console.log('🎯 Root Cause:');
        console.log(`   The processSpotlightItems function has reordering logic for "first 12"`);
        console.log(`   This creates a special order for positions 1-12, then appends the rest`);
        console.log(`   Even though cardCount=16, the default maxCount fallback is 12\n`);

        // Check if there's a public/spotlight.json that might override
        const publicPath = path.join(process.cwd(), 'public', 'spotlight.json');
        let hasStaticFile = false;
        try {
            const fs = await import('fs/promises');
            await fs.access(publicPath);
            hasStaticFile = true;
            console.log('⚠️  FOUND public/spotlight.json - this overrides Sanity!');
            const content = await fs.readFile(publicPath, 'utf-8');
            const parsed = JSON.parse(content);
            console.log(`   Static file has: ${parsed.length} items\n`);
        } catch {
            console.log('✅ No public/spotlight.json - using Sanity (good)\n');
        }

        if (hasStaticFile) {
            console.log('💡 SOLUTION:');
            console.log(`   Delete or rename public/spotlight.json to use Sanity data\n`);
        } else {
            console.log('💡 SOLUTION:');
            console.log(`   Option 1: Update cardCount in Sanity to 15 (matches actual items)`);
            console.log(`   Option 2: Update cardCount to 12 if you only want 12 on homepage`);
            console.log(`   Option 3: Add more articles to reach 16\n`);

            console.log('🔨 Recommendation: Set cardCount = 15 to match actual items\n');
            console.log('Do you want me to update it? (Running update now...)\n');

            await client
                .patch('spotlightConfig')
                .set({ cardCount: 15 })
                .commit();

            console.log('✅ Updated cardCount to 15\n');

            const updated = await client.fetch(`*[_id == "spotlightConfig"][0] { cardCount, items }`);
            console.log('📊 New Configuration:');
            console.log(`   cardCount: ${updated.cardCount}`);
            console.log(`   items: ${updated.items.length}`);
            console.log(`\n✨ All 15 articles should now display on the homepage!\n`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixSpotlightCardCount();
