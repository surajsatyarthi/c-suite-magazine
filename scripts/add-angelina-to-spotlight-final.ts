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

async function addAngelinaToSpotlight() {
    console.log('➕ Adding Angelina to Spotlight\n');

    const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

    try {
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);
        const currentIds = spotlight.items.map((item: any) => item._ref);

        console.log(`Current spotlight items: ${currentIds.length}`);
        console.log(`Angelina in list: ${currentIds.includes(angelinaId) ? 'YES' : 'NO'}\n`);

        if (currentIds.includes(angelinaId)) {
            console.log('✅ Angelina is already in spotlight!\n');
            return;
        }

        console.log('Adding Angelina to spotlight...\n');

        const updatedItems = [
            ...spotlight.items,
            {
                _type: 'reference',
                _ref: angelinaId,
                _key: `angelina-${Date.now()}`
            }
        ];

        await client
            .patch('spotlightConfig')
            .set({ items: updatedItems })
            .commit();

        console.log(`✅ Added! Spotlight now has ${updatedItems.length} articles\n`);

        // Verify
        const updated = await client.fetch(`*[_id == "spotlightConfig"][0] {
            cardCount,
            "itemCount": count(items)
        }`);

        console.log('📊 Final state:');
        console.log(`   cardCount: ${updated.cardCount}`);
        console.log(`   actual items: ${updated.itemCount}`);
        console.log(`\n${updated.cardCount === updated.itemCount ? '✅ MATCH!' : '⚠️  Mismatch'}\n`);

    } catch (error) {
        console.error('Error:', error);
    }
}

addAngelinaToSpotlight();
