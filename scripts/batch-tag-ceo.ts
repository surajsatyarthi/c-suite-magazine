import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-10-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function batchTagCEO() {
    console.log('🏷️  Batch Tagging "CEO" for all CXO Interview articles...\n');
    console.log('='.repeat(80));

    if (!process.env.SANITY_WRITE_TOKEN) {
        console.error('❌ Error: SANITY_WRITE_TOKEN is not defined in .env.local');
        return;
    }

    // 1. Find the cxo-interview category ID
    const category = await client.fetch(`*[_type == "category" && slug.current == "cxo-interview"][0]._id`);
    if (!category) {
        console.error('❌ Error: Category "cxo-interview" not found.');
        return;
    }

    // 2. Find all articles referencing this category
    const articles = await client.fetch(`*[_type in ["post", "csa"] && references($catId)] {
        _id,
        title,
        tags
    }`, { catId: category });

    console.log(`Found ${articles.length} articles in CXO Interview category.\n`);

    let updatedCount = 0;

    for (const article of articles) {
        const currentTags = article.tags || [];
        if (!currentTags.includes('CEO')) {
            console.log(` Updating: ${article.title}`);
            try {
                await client
                    .patch(article._id)
                    .setIfMissing({ tags: [] })
                    .append('tags', ['CEO'])
                    .commit();
                updatedCount++;
            } catch (err: any) {
                console.error(` ❌ Failed to update ${article.title}:`, err.message);
            }
        } else {
            console.log(` Skipping (Already tagged): ${article.title}`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Batch Tagging Complete. ${updatedCount} articles updated.`);
}

batchTagCEO().catch(console.error);
