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

async function cleanupAngelinaArticles() {
    console.log('🗑️  Removing Older Angelina Article\n');

    // The older article created Nov 9 vs Nov 11
    const olderArticleId = 'Xj1aOvHL2Hs0lhtupB0F2K'; // "Anchored in America" (Nov 9)

    try {
        const article = await client.fetch(`*[_id == $id][0]{_id, title, _createdAt}`, { id: olderArticleId });

        if (!article) {
            console.log('⚠️  Article not found. May have already been deleted.\n');
            return;
        }

        console.log(`Found article: ${article.title}`);
        console.log(`Created: ${article._createdAt}\n`);
        console.log('Deleting...\n');

        await client.delete(olderArticleId);

        console.log('✅ Successfully deleted older Angelina article!\n');
        console.log('Remaining article: "A Global Mission Taking Root in America: Angelina Usanova\'s Bold New Era"\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanupAngelinaArticles();
