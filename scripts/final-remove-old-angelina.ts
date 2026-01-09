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

async function removeOldAngelinaFromSpotlight() {
    console.log('🗑️  Removing Old Angelina from Spotlight and Deleting\n');

    const oldArticleId = 'W97YnOaKPdmcl7N3eWtBwI'; // "Taking Root"

    try {
        // Step 1: Get spotlight config
        console.log('Step 1: Getting spotlight config...\n');
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);

        const oldCount = spotlight.items.length;
        console.log(`Current spotlight items: ${oldCount}`);

        // Step 2: Filter out the old article
        const updatedItems = spotlight.items.filter((item: any) =>
            item._ref !== oldArticleId
        );

        console.log(`Filtered spotlight items: ${updatedItems.length}\n`);

        if (updatedItems.length === oldCount) {
            console.log('⚠️  Old article not found in spotlight items\n');
        } else {
            console.log('Step 2: Updating spotlight config...\n');
            await client
                .patch('spotlightConfig')
                .set({ items: updatedItems })
                .commit();

            console.log(`✅ Removed from spotlight (${oldCount} → ${updatedItems.length})\n`);
        }

        // Step 3: Delete the article
        console.log('Step 3: Deleting old article...\n');
        try {
            await client.delete(oldArticleId);
            console.log('✅ Successfully deleted "Taking Root in America"!\n');
        } catch (error: any) {
            if (error.statusCode === 404) {
                console.log('ℹ️  Article already deleted\n');
            } else {
                throw error;
            }
        }

        // Step 4: Verify
        console.log('Step 4: Final verification...\n');
        const remaining = await client.fetch(`
            *[_type in ["post", "csa"] && title match "*Angelina Usanova*"] {
                _id,
                title,
                slug
            }
        `);

        console.log(`Angelina Usanova articles remaining: ${remaining.length}\n`);
        remaining.forEach((article: any) => {
            console.log(`✅ ${article.title}`);
            console.log(`   ID: ${article._id}`);
            console.log(`   Slug: ${article.slug?.current}\n`);
        });

        if (remaining.length === 1) {
            console.log('✨ Perfect! Only the correct "Anchored in America" article remains.\n');
            console.log('Ready to upload hero image!\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

removeOldAngelinaFromSpotlight();
