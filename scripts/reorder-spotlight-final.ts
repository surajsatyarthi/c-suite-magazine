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

async function reorderSpotlight() {
    console.log('🔄 Reordering Spotlight Grid\n');
    console.log('='.repeat(80));

    // Read current config
    const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json');
    const spotlight = JSON.parse(fs.readFileSync(spotlightPath, 'utf-8'));

    console.log('\nChanges to make:');
    console.log('   1. Bill Faruki → Grid position 2');
    console.log('   2. Remove Olga Denysiuk');
    console.log('   3. Add Dean Fealk\n');

    // Find articles
    const rich = spotlight.find((item: any) => item.href?.includes('rich-stinson'));
    const stella = spotlight.find((item: any) => item.href?.includes('stella-ambrose'));
    const bill = spotlight.find((item: any) => item.href?.includes('bill-faruki'));

    // Remove Olga and get others
    const others = spotlight.filter((item: any) =>
        !item.href?.includes('rich-stinson') &&
        !item.href?.includes('stella-ambrose') &&
        !item.href?.includes('bill-faruki') &&
        !item.href?.includes('olga-denysiuk') // Remove Olga
    );

    console.log(`Removed: Olga Denysiuk`);
    console.log(`Current grid articles: ${others.length}`);
    console.log(`Need to add Dean Fealk to maintain 13 total\n`);

    // Add Dean Fealk
    const deanFealk = {
        image: '/Featured%20section/Dean Fealk.png',
        href: '/category/cxo-interview/dean-fealk',
        title: 'C‑Suite Magazine'
    };

    // New order: Rich, Stella, Bill, then others (which now includes Dean)
    const reordered = [
        rich,
        stella,
        bill,
        ...others,
        deanFealk
    ].filter(Boolean);

    console.log('='.repeat(80));
    console.log('\nNew Order:\n');
    reordered.forEach((item: any, i: number) => {
        const label = i === 0 ? '👑 Executive' : `   Grid ${i}`;
        const name = item.href?.split('/').pop();
        console.log(`${label}. ${name}`);
    });

    console.log(`\nTotal: ${reordered.length} articles\n`);

    // Save
    fs.writeFileSync(spotlightPath, JSON.stringify(reordered, null, 2));
    console.log('✅ Updated public/spotlight.json\n');

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
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log('   ✅ Bill Faruki at Grid 2');
    console.log('   ✅ Olga removed');
    console.log('   ✅ Dean Fealk added');
    console.log(`   ✅ Total: ${reordered.length} articles\n`);
}

reorderSpotlight();
