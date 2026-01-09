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

async function moveArticlesToCXO() {
    console.log('📝 Moving Articles to CXO Interview Category\n');
    console.log('='.repeat(100));

    // Load articles to move
    const data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'scripts', 'articles-to-move.json'), 'utf-8'));

    console.log(`Target Category ID: ${data.cxoCategoryId}`);
    console.log(`Articles to update: ${data.articles.length}\n`);
    console.log('='.repeat(100));

    for (const article of data.articles) {
        console.log(`\n📄 ${article.title}`);
        console.log(`   Current: ${article.currentCategory || 'None'}`);

        try {
            // Get current categories
            const current = await client.fetch(`*[_id == $id][0] { categories }`, { id: article._id });

            if (!current) {
                console.log(`   ❌ Article not found\n`);
                continue;
            }

            // Add CXO Interview category if not already present
            const categoryRefs = current.categories || [];
            const hasCXO = categoryRefs.some((ref: any) => ref._ref === data.cxoCategoryId);

            if (hasCXO) {
                console.log(`   ℹ️  Already has CXO Interview\n`);
                continue;
            }

            // Add CXO Interview as first category (primary)
            const updatedCategories = [
                { _type: 'reference', _ref: data.cxoCategoryId, _key: `cxo-${Date.now()}` },
                ...categoryRefs
            ];

            await client
                .patch(article._id)
                .set({ categories: updatedCategories })
                .commit();

            console.log(`   ✅ Added CXO Interview category\n`);

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    }

    console.log('='.repeat(100));
    console.log('\n✅ Category updates complete!\n');

    // Verify
    console.log('🔍 Verifying updates...\n');
    let success = 0;
    let failed = 0;

    for (const article of data.articles) {
        const result = await client.fetch(
            `*[_id == $id][0] { "hasCXO": "CXO Interview" in categories[]->title }`,
            { id: article._id }
        );

        if (result && result.hasCXO) {
            success++;
        } else {
            failed++;
            console.log(`❌ ${article.title}`);
        }
    }

    console.log(`\n✅ Successfully updated: ${success}/${data.articles.length}`);
    if (failed > 0) console.log(`❌ Failed: ${failed}`);
    console.log('\n');
}

moveArticlesToCXO();
