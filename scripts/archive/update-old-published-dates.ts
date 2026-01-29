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

async function updateOldPublishedDates() {
    console.log('📅 Updating PublishedAt Dates for Old Articles\n');

    //Articles with old publishedAt dates
    const articlesToUpdate = [
        { id: '6FGiNia5tWM9A0y142DNeH', title: 'Bryce Tully', newDate: '2024-11-06T23:00:00.000Z' }, // Use creation date 2025-11-06
        { id: 'W0r3Dco17y9seUgyVZMSHl', title: 'Olga Denysiuk', newDate: '2024-11-10T17:00:00.000Z' }, // Use creation date 2025-11-10
        { id: 'W0r3Dco17y9seUgyVZMhnz', title: 'Bill Faruki', newDate: '2024-11-10T17:00:00.000Z' }, // Use creation date 2025-11-10
    ];

    console.log(`Updating ${articlesToUpdate.length} articles\n`);

    for (const article of articlesToUpdate) {
        try {
            const doc = await client.fetch(`*[_id == $id][0]{title, publishedAt, _createdAt}`, { id: article.id });

            if (!doc) {
                console.log(`⚠️  Article ${article.title} not found, skipping\n`);
                continue;
            }

            console.log(`📄 ${doc.title}`);
            console.log(`   Old publishedAt: ${doc.publishedAt}`);
            console.log(`   New publishedAt: ${article.newDate}`);
            console.log(`   Created: ${doc._createdAt}`);

            await client
                .patch(article.id)
                .set({ publishedAt: article.newDate })
                .commit();

            console.log(`   ✅ Updated successfully\n`);

        } catch (error) {
            console.error(`   ❌ Error updating ${article.title}:`, error);
        }
    }

    console.log('\n✅ All updates complete!\n');
    console.log('Summary:');
    console.log(`  - Updated ${articlesToUpdate.length} articles`);
    console.log(`  - Changed from 2020 dates to 2024-2025 dates`);
    console.log(`  - Articles will now appear in category page results\n`);
}

updateOldPublishedDates();
