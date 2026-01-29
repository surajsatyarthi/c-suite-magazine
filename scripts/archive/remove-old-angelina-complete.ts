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

async function removeOldAngelinaCompletely() {
    console.log('🔧 Removing Old Angelina Article Completely\n');

    const oldArticleId = 'W97YnOaKPdmcl7N3eWtBwI'; // "Taking Root" - the unwanted one
    const newArticleId = 'Xj1aOvHL2Hs0lhtupB0F2K'; // "Anchored" - manually restored, the one to keep

    try {
        // Step 1: Check current spotlight config
        console.log('Step 1: Checking spotlight configuration...\n');
        const spotlightConfig = await client.fetch(`*[_id == "spotlightConfig"][0] {
            _id,
            "articles": articles[]-> {
                _id,
                title
            }
        }`);

        if (spotlightConfig?.articles) {
            const hasOldArticle = spotlightConfig.articles.some((a: any) => a._id === oldArticleId);
            console.log(`Old article in spotlight: ${hasOldArticle ? '✅ Yes (needs removal)' : '❌ No'}`);

            if (hasOldArticle) {
                console.log('\nStep 2: Removing old article from spotlight...\n');

                // Get the spotlight config with references
                const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);

                // Filter out the old article
                const updatedArticles = spotlight.articles.filter((ref: any) =>
                    ref._ref !== oldArticleId
                );

                await client
                    .patch('spotlightConfig')
                    .set({ articles: updatedArticles })
                    .commit();

                console.log('✅ Removed from spotlight\n');
            }
        }

        // Step 3: Delete the old article
        console.log('Step 3: Deleting old article...\n');
        try {
            await client.delete(oldArticleId);
            console.log('✅ Old article "Taking Root in America" deleted successfully!\n');
        } catch (error: any) {
            if (error.statusCode === 404) {
                console.log('✅ Article already deleted\n');
            } else {
                throw error;
            }
        }

        // Step 4: Verify only the correct article remains
        console.log('Step 4: Verifying remaining articles...\n');
        const remaining = await client.fetch(`
            *[_type in ["post", "csa"] && title match "*Angelina Usanova*"] {
                _id,
                title,
                slug
            }
        `);

        console.log(`Found ${remaining.length} Angelina Usanova article(s):\n`);
        remaining.forEach((article: any) => {
            const mark = article._id === newArticleId ? '✅' : '⚠️';
            console.log(`${mark} ${article.title}`);
            console.log(`   ID: ${article._id}`);
            console.log(`   Slug: ${article.slug?.current}\n`);
        });

        if (remaining.length === 1 && remaining[0]._id === newArticleId) {
            console.log('✨ Perfect! Only the correct "Anchored in America" article remains.\n');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

removeOldAngelinaCompletely();
