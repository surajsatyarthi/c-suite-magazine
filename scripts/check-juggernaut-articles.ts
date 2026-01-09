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

async function checkJuggernautArticles() {
    console.log('🔍 Checking Which Industry Juggernaut Articles Actually Exist\n');
    console.log('='.repeat(80));

    // Get configured items
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`);

    if (!config || !config.items) {
        console.log('No config found\n');
        return;
    }

    console.log(`\nConfigured Items: ${config.items.length}\n`);

    for (const item of config.items) {
        const slug = item.link.split('/').pop();
        const category = item.link.split('/')[2];

        console.log(`\n${item.title}`);
        console.log(`   Link: ${item.link}`);
        console.log(`   Category: ${item.category}`);

        // Check if article exists
        const article = await client.fetch(
            `*[_type == "post" && slug.current == $slug][0] { _id, title }`,
            { slug }
        );

        if (article) {
            console.log(`   ✅ Article EXISTS: "${article.title}"`);
        } else {
            console.log(`   ❌ Article DOES NOT EXIST`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Summary:\n');

    let existing = 0;
    let missing = 0;

    for (const item of config.items) {
        const slug = item.link.split('/').pop();
        const article = await client.fetch(
            `*[_type == "post" && slug.current == $slug][0] { _id }`,
            { slug }
        );
        if (article) existing++;
        else missing++;
    }

    console.log(`   ✅ Articles that exist: ${existing}`);
    console.log(`   ❌ Articles missing: ${missing}`);
    console.log(`   📋 Total configured: ${config.items.length}\n`);
}

checkJuggernautArticles();
