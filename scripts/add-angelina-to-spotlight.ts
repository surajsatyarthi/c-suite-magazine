import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';
import { nanoid } from 'nanoid';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function addAngelinaToSpotlight() {
    const angelinaArticleId = 'W97YnOaKPdmcl7N3eWtBwI'; // "A Global Mission Taking Root in America"

    console.log('🔧 Adding Angelina Article to Homepage Spotlight\n');

    try {
        // Get spotlight config
        const spotlight = await client.fetch(`*[_type == "spotlightConfig"][0]{
            _id,
            title,
            items[]->{_id, title}
        }`);

        if (!spotlight) {
            console.log('❌ Spotlight config not found\n');
            return;
        }

        console.log(`Current spotlight: ${spotlight.title}`);
        console.log(`Current items: ${spotlight.items.length}\n`);

        // Check if article is already in spotlight
        const alreadyInSpotlight = spotlight.items.some((item: any) => item._id === angelinaArticleId);

        if (alreadyInSpotlight) {
            console.log('✅ Angelina article is already in spotlight!\n');
            return;
        }

        // Add the article to spotlight
        const updatedItems = [
            ...spotlight.items.map((item: any) => ({
                _type: 'reference',
                _ref: item._id,
                _key: nanoid()
            })),
            {
                _type: 'reference',
                _ref: angelinaArticleId,
                _key: nanoid()
            }
        ];

        console.log(`Adding Angelina article to spotlight...`);
        console.log(`New spotlight count: ${updatedItems.length} items\n`);

        await client
            .patch(spotlight._id)
            .set({ items: updatedItems })
            .commit();

        console.log('✅ Successfully added Angelina article to spotlight!\n');
        console.log('Article: "A Global Mission Taking Root in America: Angelina Usanova\'s Bold New Era"\n');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addAngelinaToSpotlight();
