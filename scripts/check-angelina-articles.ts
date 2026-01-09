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

async function checkAngelinaArticles() {
    console.log('🔍 Checking Angelina Usanova Articles\n');

    const articles = await client.fetch(`
        *[_type in ["post", "csa"] && title match "*Angelina Usanova*"] {
            _id,
            _type,
            title,
            slug,
            _createdAt,
            publishedAt,
            "categories": categories[]->title
        }
    `);

    console.log(`Found ${articles.length} articles with "Angelina Usanova" in the title:\n`);

    articles.forEach((article: any, i: number) => {
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   Type: ${article._type}`);
        console.log(`   ID: ${article._id}`);
        console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
        console.log(`   Created: ${article._createdAt}`);
        console.log(`   Published: ${article.publishedAt || 'Not set'}`);
        console.log(`   Categories: ${article.categories?.join(', ') || 'None'}\n`);
    });

    if (articles.length === 2) {
        console.log('\n💡 Analysis:');
        console.log('There are 2 separate articles about Angelina Usanova with different titles.');
        console.log('This appears to be intentional - two different articles/interviews.\n');
    }
}

checkAngelinaArticles().catch(console.error);
