import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function fixSpotlightConfig() {
    console.log('🔧 Fixing Spotlight Configuration\n');
    console.log('='.repeat(80));

    const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json');
    const spotlight = JSON.parse(fs.readFileSync(spotlightPath, 'utf-8'));

    console.log(`\nCurrent state: ${spotlight.length} articles\n`);

    // Step 1: Fix Rich Stinson slug
    const richIndex = spotlight.findIndex((item: any) =>
        item.title === 'Rich Stinson' || item.href?.includes('rich-stinson')
    );

    if (richIndex !== -1) {
        console.log('1. Fixing Rich Stinson slug:');
        console.log(`   OLD: ${spotlight[richIndex].href}`);
        spotlight[richIndex].href = '/category/cxo-interview/rich-stinson-ceo-southwire';
        spotlight[richIndex].title = 'Rich Stinson: Visionary Leader Powering America\'s Electrification Future';
        console.log(`   NEW: ${spotlight[richIndex].href}\n`);
    }

    // Step 2: Fix Stella Ambrose slug
    const stellaIndex = spotlight.findIndex((item: any) =>
        item.title?.includes('Stella') || item.href?.includes('stella')
    );

    if (stellaIndex !== -1) {
        console.log('2. Fixing Stella Ambrose slug:');
        console.log(`   OLD: ${spotlight[stellaIndex].href}`);
        spotlight[stellaIndex].href = '/category/cxo-interview/stella-ambrose-deputy-ceo-sawit-kinabalu';
        spotlight[stellaIndex].title = 'Stella Ambrose: Visionary Trailblazer in Sustainable Palm Oil Leadership';
        console.log(`   NEW: ${spotlight[stellaIndex].href}\n`);
    }

    // Step 3: Remove articles at positions 13-16 to get to 13 total
    console.log('3. Removing articles to reach 13 total:\n');

    // Separate Rich Stinson (Executive in Focus) from grid
    const richStinson = spotlight.find((item: any) =>
        item.href?.includes('rich-stinson')
    );

    const gridArticles = spotlight.filter((item: any) =>
        !item.href?.includes('rich-stinson')
    );

    console.log(`   Executive in Focus: 1 (Rich Stinson)`);
    console.log(`   Grid articles: ${gridArticles.length} → need 12\n`);

    // Keep only first 12 grid articles
    const finalGrid = gridArticles.slice(0, 12);
    const removed = gridArticles.slice(12);

    if (removed.length > 0) {
        console.log(`   Removing ${removed.length} articles:\n`);
        removed.forEach((item: any, i: number) => {
            console.log(`   ${i + 1}. ${item.title || 'Generic'} - ${item.href?.split('/').pop()}`);
        });
        console.log();
    }

    // Rebuild final array: Rich first, then 12 grid articles
    const finalSpotlight = [richStinson, ...finalGrid];

    console.log('='.repeat(80));
    console.log('\n✅ Final Configuration:\n');
    console.log(`   Total articles: ${finalSpotlight.length}`);
    console.log(`   Executive in Focus: 1`);
    console.log(`   Grid: 12\n`);

    // Show final list
    console.log('Final Article List:\n');
    finalSpotlight.forEach((item: any, i: number) => {
        const label = i === 0 ? '👑 EXECUTIVE' : `   Grid ${i}`;
        console.log(`${label}. ${item.title}`);
        console.log(`          ${item.href}\n`);
    });

    // Save
    fs.writeFileSync(spotlightPath, JSON.stringify(finalSpotlight, null, 2));
    console.log('='.repeat(80));
    console.log('\n💾 Saved to public/spotlight.json\n');
}

fixSpotlightConfig();
