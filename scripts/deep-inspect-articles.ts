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

async function deepInspectSpotlightArticles() {
    console.log('🔬 DEEP INSPECTION of Spotlight Articles\n');

    try {
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);
        const spotlightIds = spotlight.items.map((item: any) => item._ref);

        // Get FULL RAW data for first 3 articles to see structure
        console.log('Inspecting first 3 articles in detail...\n');
        const sampleIds = spotlightIds.slice(0, 3);

        for (const id of sampleIds) {
            const article = await client.getDocument(id);
            console.log('='.repeat(100));
            console.log(`\nArticle: ${article.title}`);
            console.log(`ID: ${article._id}\n`);
            console.log('FULL RAW DATA:');
            console.log(JSON.stringify(article, null, 2));
            console.log('\n');
        }

        // Also check Angelina's article
        const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';
        const angelina = await client.getDocument(angelinaId);
        console.log('='.repeat(100));
        console.log(`\nANGELINA ARTICLE - FULL RAW DATA:`);
        console.log(JSON.stringify(angelina, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

deepInspectSpotlightArticles();
