import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
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

async function syncSanityWithStaticFile() {
    console.log('🔄 Syncing Sanity with Static File\n');
    console.log('='.repeat(80));

    try {
        // Read static file
        const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json');
        const spotlight = JSON.parse(fs.readFileSync(spotlightPath, 'utf-8'));

        console.log(`\nStatic file has: ${spotlight.length} articles\n`);

        // Get article IDs from Sanity by slug
        const slugs = spotlight
            .map((item: any) => item.href?.split('/').pop())
            .filter(Boolean);

        console.log('Fetching articles from Sanity by slug...\n');

        const articles = await client.fetch(`
            *[_type in ["post", "csa"] && slug.current in $slugs] {
                _id,
                title,
                slug,
                _type
            }
        `, { slugs });

        console.log(`Found ${articles.length} matching articles in Sanity\n`);

        // Build items array in the same order as static file
        const orderedItems = [];

        for (const staticItem of spotlight) {
            const slug = staticItem.href?.split('/').pop();
            const match = articles.find((a: any) => a.slug?.current === slug);

            if (match) {
                orderedItems.push({
                    _type: 'reference',
                    _ref: match._id,
                    _key: `${match._type}-${slug}`
                });
                console.log(`✅ ${match.title} (${match._type})`);
            } else {
                console.log(`⚠️  No match for slug: ${slug}`);
            }
        }

        console.log(`\nBuilt ${orderedItems.length} items for Sanity\n`);

        // Update Sanity
        console.log('Updating Sanity spotlightConfig...\n');

        await client
            .patch('spotlightConfig')
            .set({
                items: orderedItems,
                cardCount: orderedItems.length
            })
            .commit();

        console.log('='.repeat(80));
        console.log('\n✅ Sanity Updated:\n');
        console.log(`   Total items: ${orderedItems.length}`);
        console.log(`   cardCount: ${orderedItems.length}\n`);

        // Verify
        const updated = await client.fetch(`*[_id == "spotlightConfig"][0] {
            cardCount,
            "itemCount": count(items)
        }`);

        console.log('📊 Verification:\n');
        console.log(`   Sanity cardCount: ${updated.cardCount}`);
        console.log(`   Sanity items: ${updated.itemCount}`);
        console.log(`   Static file: ${spotlight.length}`);
        console.log(`\n${updated.cardCount === spotlight.length && updated.itemCount === spotlight.length ? '✅ SYNCED!' : '⚠️  Mismatch'}\n`);

    } catch (error) {
        console.error('Error:', error);
    }
}

syncSanityWithStaticFile();
