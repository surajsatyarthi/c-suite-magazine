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

async function fixAngelinaCategory() {
    console.log('🔧 Fixing Angelina Article Category\n');

    const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

    try {
        // Get current state
        const article = await client.fetch(`*[_id == $id][0] {
            _id,
            title,
            slug,
            categories[]-> { _id, title, slug }
        }`, { id: angelinaId });

        console.log('Current state:');
        console.log(`   Title: ${article.title}`);
        console.log(`   Slug: ${article.slug?.current}`);
        console.log(`   Categories: ${article.categories?.map((c: any) => c.title).join(', ')}\n`);

        // Get CXO Interview category
        const cxoCategory = await client.fetch(`*[_type == "category" && title == "CXO Interview"][0] { _id, title, slug }`);

        if (!cxoCategory) {
            console.error('❌ CXO Interview category not found!');
            return;
        }

        console.log(`Found CXO Interview category: ${cxoCategory._id}\n`);

        // Update article to have ONLY CXO Interview as category
        console.log('Updating categories to ONLY [CXO Interview]...\n');

        await client
            .patch(angelinaId)
            .set({
                categories: [
                    {
                        _type: 'reference',
                        _ref: cxoCategory._id,
                        _key: 'cxo-interview'
                    }
                ]
            })
            .commit();

        console.log('✅ Categories updated!\n');

        // Verify
        const updated = await client.fetch(`*[_id == $id][0] {
            title,
            slug,
            categories[]-> { title, slug }
        }`, { id: angelinaId });

        console.log('📊 Final state:');
        console.log(`   Title: ${updated.title}`);
        console.log(`   Slug: ${updated.slug?.current}`);
        console.log(`   Categories: ${updated.categories?.map((c: any) => c.title).join(', ')}`);
        console.log(`   Expected URL: /category/${updated.categories[0]?.slug?.current}/${updated.slug?.current}\n`);

        const expectedUrl = `/category/${updated.categories[0]?.slug?.current}/${updated.slug?.current}`;
        console.log(`✅ Article should now be accessible at: https://csuitemagazine.global${expectedUrl}\n`);

    } catch (error) {
        console.error('Error:', error);
    }
}

fixAngelinaCategory();
