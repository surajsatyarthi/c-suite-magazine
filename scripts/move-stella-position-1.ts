import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
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

async function moveStellaToPosOne() {
    console.log('🔄 Moving Stella Ambrose to Grid Position 1\n');

    // Read current config
    const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json');
    const spotlight = JSON.parse(fs.readFileSync(spotlightPath, 'utf-8'));

    // Find Rich Stinson (Executive in Focus)
    const richIndex = spotlight.findIndex((item: any) =>
        item.href?.includes('rich-stinson')
    );

    // Find Stella
    const stellaIndex = spotlight.findIndex((item: any) =>
        item.href?.includes('stella-ambrose')
    );

    if (richIndex === -1 || stellaIndex === -1) {
        console.error('❌ Could not find Rich or Stella');
        return;
    }

    console.log(`Current positions:`);
    console.log(`   Rich Stinson: position ${richIndex} (Executive in Focus)`);
    console.log(`   Stella Ambrose: position ${stellaIndex} (Grid #${stellaIndex})\n`);

    // Reorder: Rich first, then Stella, then everyone else
    const rich = spotlight[richIndex];
    const stella = spotlight[stellaIndex];
    const others = spotlight.filter((item: any, i: number) =>
        i !== richIndex && i !== stellaIndex
    );

    const reordered = [rich, stella, ...others];

    console.log('New order:');
    reordered.forEach((item: any, i: number) => {
        const label = i === 0 ? '👑 Executive' : `   Grid ${i}`;
        console.log(`${label}. ${item.title}`);
    });

    // Save
    fs.writeFileSync(spotlightPath, JSON.stringify(reordered, null, 2));
    console.log('\n✅ Updated public/spotlight.json\n');

    // Sync to Sanity
    console.log('Syncing to Sanity...\n');

    const slugs = reordered
        .map((item: any) => item.href?.split('/').pop())
        .filter(Boolean);

    const articles = await client.fetch(`
        *[_type in ["post", "csa"] && slug.current in $slugs] {
            _id,
            title,
            slug,
            _type
        }
    `, { slugs });

    const orderedItems = [];
    for (const item of reordered) {
        const slug = item.href?.split('/').pop();
        const match = articles.find((a: any) => a.slug?.current === slug);
        if (match) {
            orderedItems.push({
                _type: 'reference',
                _ref: match._id,
                _key: `${match._type}-${slug}`
            });
        }
    }

    await client
        .patch('spotlightConfig')
        .set({ items: orderedItems })
        .commit();

    console.log('✅ Synced to Sanity\n');
    console.log('📊 Final Configuration:');
    console.log('   Executive in Focus: Rich Stinson');
    console.log('   Grid Position 1: Stella Ambrose ⭐\n');
}

moveStellaToPosOne();
