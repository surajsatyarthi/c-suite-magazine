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

async function deleteOldAngelinaArticle() {
    console.log('🗑️  Deleting OLD Angelina Article (Taking Root)\n');

    // The UNWANTED article - Created Nov 11 - "Taking Root in America"
    const articleToDeleteId = 'W97YnOaKPdmcl7N3eWtBwI';

    // The WANTED article - Created Nov 9 - "Anchored in America" (manually restored)
    const articleToKeepId = 'Xj1aOvHL2Hs0lhtupB0F2K';

    try {
        // Check both articles
        const articles = await client.fetch(`
            *[_id in [$deleteId, $keepId]] {
                _id,
                title,
                _createdAt,
                slug
            }
        `, { deleteId: articleToDeleteId, keepId: articleToKeepId });

        console.log('Current Status:\n');
        articles.forEach((article: any) => {
            const status = article._id === articleToKeepId ? '✅ KEEP' : '❌ DELETE';
            console.log(`${status} - ${article.title}`);
            console.log(`   ID: ${article._id}`);
            console.log(`   Created: ${article._createdAt}`);
            console.log(`   Slug: ${article.slug?.current}\n`);
        });

        const articleToDelete = articles.find((a: any) => a._id === articleToDeleteId);

        if (!articleToDelete) {
            console.log('✅ Old article already deleted!\n');
            return;
        }

        console.log(`Deleting: "${articleToDelete.title}"...\n`);
        await client.delete(articleToDeleteId);

        console.log('✅ Successfully deleted the old "Taking Root" article!\n');
        console.log('📌 Remaining article: "A Global Mission, Anchored in America: Angelina Usanova\'s Upcoming Endeavors"\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteOldAngelinaArticle();
