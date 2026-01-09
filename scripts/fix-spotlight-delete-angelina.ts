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

async function fixSpotlightAndDeleteOldAngelina() {
    console.log('🔧 Fixing Spotlight and Deleting Old Angelina\n');

    const oldArticleId = 'W97YnOaKPdmcl7N3eWtBwI'; // "Taking Root" - remove this
    const newArticleId = 'Xj1aOvHL2Hs0lhtupB0F2K'; // "Anchored" - keep this

    try {
        // Step 1: Get raw spotlight config
        console.log('Step 1: Fetching spotlight configuration...\n');
        const spotlightConfig = await client.getDocument('spotlightConfig');

        console.log('Current spotlight articles:', JSON.stringify(spotlightConfig.articles, null, 2));

        // Step 2: Remove the old article from spotlight
        if (spotlightConfig.articles && spotlightConfig.articles.length > 0) {
            const hasOldArticle = spotlightConfig.articles.some((ref: any) => ref._ref === oldArticleId);

            console.log(`\nOld article in spotlight: ${hasOldArticle ? '✅ Yes' : '❌ No'}\n`);

            if (hasOldArticle) {
                console.log('Step 2: Removing old article from spotlight...\n');
                const updatedArticles = spotlightConfig.articles.filter((ref: any) =>
                    ref._ref !== oldArticleId
                );

                await client
                    .patch('spotlightConfig')
                    .set({ articles: updatedArticles })
                    .commit();

                console.log(`✅ Removed from spotlight (was ${spotlightConfig.articles.length}, now ${updatedArticles.length})\n`);
            } else {
                console.log('Step 2: Old article not in spotlight, skipping...\n');
            }
        }

        // Step 3: Now delete the old article
        console.log('Step 3: Deleting old article...\n');
        try {
            await client.delete(oldArticleId);
            console.log('✅ Successfully deleted "Taking Root in America" article!\n');
        } catch (error: any) {
            if (error.statusCode === 404) {
                console.log('ℹ️  Article already deleted\n');
            } else {
                console.error('Delete failed:', error.message);
                throw error;
            }
        }

        // Step 4: Verify
        console.log('Step 4: Verifying...\n');
        const remaining = await client.fetch(`
            *[_type in ["post", "csa"] && title match "*Angelina Usanova*"] {
                _id,
                title
            }
        `);

        console.log(`Remaining Angelina articles: ${remaining.length}\n`);
        remaining.forEach((article: any) => {
            console.log(`  - ${article.title} (${article._id})`);
        });

        if (remaining.length === 1 && remaining[0]._id === newArticleId) {
            console.log('\n✨ Perfect! Only the correct "Anchored in America" article remains.\n');
        } else if (remaining.length > 1) {
            console.log('\n⚠️  Multiple articles still exist!\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

fixSpotlightAndDeleteOldAngelina();
