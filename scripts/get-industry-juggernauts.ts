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

async function getIndustryJuggernauts() {
    console.log('📊 Industry Juggernauts - Category List\n');
    console.log('='.repeat(80));

    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0] {
        _id,
        cardCount,
        items[]-> {
            _id,
            title,
            slug,
            "categories": categories[]->title,
            "primaryCategory": categories[0]->title
        }
    }`);

    if (!config) {
        console.log('❌ No industryJuggernautConfig found\n');
        return;
    }

    const validItems = (config.items || []).filter(item => item !== null);

    console.log(`\nTotal: ${validItems.length} Industry Juggernauts\n`);
    console.log('='.repeat(80));
    console.log('\n📋 LIST:\n');

    validItems.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title || 'Untitled'}`);
        console.log(`   Category: ${article.primaryCategory || 'None'}\n`);
    });

    const allCategories = new Set();
    validItems.forEach(article => {
        if (article.categories) {
            article.categories.forEach(cat => allCategories.add(cat));
        }
    });

    console.log('='.repeat(80));
    console.log('\n📌 UNIQUE CATEGORIES:\n');
    Array.from(allCategories).sort().forEach((cat, i) => {
        console.log(`${i + 1}. ${cat}`);
    });
    console.log('\n');
}

getIndustryJuggernauts();
