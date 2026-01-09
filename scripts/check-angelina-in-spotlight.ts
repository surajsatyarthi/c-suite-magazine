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

async function checkAngelinaInSpotlight() {
    console.log('🔍 Checking if Angelina is in Spotlight\n');

    const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

    try {
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);
        const spotlightIds = spotlight.items.map((item: any) => item._ref);

        console.log(`Total spotlight items: ${spotlightIds.length}`);
        console.log(`Angelina in spotlight: ${spotlightIds.includes(angelinaId) ? '✅ YES' : '❌ NO'}\n`);

        // Check Angelina's article
        const angelina = await client.fetch(`*[_id == $id][0] {
            _id,
            title,
            slug,
            "primaryCategory": categories[0]-> { title, slug },
            heroImage,
            mainImage,
            spotlightImage
        }`, { id: angelinaId });

        console.log('Angelina Article Status:');
        console.log(`   Title: ${angelina.title}`);
        console.log(`   URL: /category/${angelina.primaryCategory?.slug?.current}/${angelina.slug?.current}`);
        console.log(`   Category: ${angelina.primaryCategory?.title}`);
        console.log(`   heroImage: ${angelina.heroImage ? '✅' : '❌'}`);
        console.log(`   mainImage: ${angelina.mainImage ? '✅' : '❌'}`);
        console.log(`   spotlightImage: ${angelina.spotlightImage ? '✅' : '❌'}\n`);

        if (!spotlightIds.includes(angelinaId)) {
            console.log('❓ Should Angelina be added to spotlight?\n');
            console.log('   This depends on whether she should appear in the homepage spotlight section.');
            console.log('   Currently she has all the right fields but is NOT in the spotlight list.\n');
        } else {
            console.log('✅ Angelina IS in the spotlight list.\n');
        }

        // Show current URL
        const fullUrl = `https://csuitemagazine.global/category/${angelina.primaryCategory?.slug?.current}/${angelina.slug?.current}`;
        console.log(`📍 Article URL: ${fullUrl}\n`);

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAngelinaInSpotlight();
