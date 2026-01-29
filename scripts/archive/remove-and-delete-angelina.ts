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

async function removeAndDeleteAngelina() {
    const articleToRemove = 'Xj1aOvHL2Hs0lhtupB0F2K'; // Older Angelina article

    console.log('🔧 Step 1: Removing article from Spotlight Config\n');

    try {
        // Get spotlight config
        const spotlight = await client.fetch(`*[_type == "spotlightConfig"][0]{
            _id,
            items[]->{_id}
        }`);

        if (!spotlight) {
            console.log('⚠️  Spotlight config not found\n');
            return;
        }

        // Filter out the article to remove
        const updatedItems = spotlight.items
            .filter((item: any) => item._id !== articleToRemove)
            .map((item: any) => ({
                _type: 'reference',
                _ref: item._id,
                _key: Math.random().toString(36).substring(7)
            }));

        console.log(`Original spotlight items: ${spotlight.items.length}`);
        console.log(`Updated spotlight items: ${updatedItems.length}\n`);

        // Update spotlight config
        await client
            .patch(spotlight._id)
            .set({ items: updatedItems })
            .commit();

        console.log('✅ Removed from spotlight config\n');

        // Step 2: Delete the article
        console.log('🗑️  Step 2: Deleting article\n');

        const article = await client.fetch(`*[_id == $id][0]{title}`, { id: articleToRemove });
        console.log(`Deleting: ${article?.title}\n`);

        await client.delete(articleToRemove);

        console.log('✅ Successfully deleted article!\n');
        console.log('Summary:');
        console.log('  - Removed from spotlight config');
        console.log('  - Article deleted');
        console.log('  - Remaining Angelina article: "A Global Mission Taking Root in America"\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

removeAndDeleteAngelina();
