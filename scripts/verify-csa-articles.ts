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

async function verifyCSAArticles() {
    console.log('🔍 Verifying All CSA Articles\n');

    try {
        // Get all CSA articles
        const csaArticles = await client.fetch(`*[_type == "csa"] {
            _id,
            title,
            slug,
            mainImage {
                asset-> { url }
            },
            "categories": categories[]->title,
            publishedAt
        } | order(title asc)`);

        console.log(`Total CSA Articles: ${csaArticles.length}\n`);
        console.log('='.repeat(100));

        csaArticles.forEach((csa: any, i: number) => {
            console.log(`\n${i + 1}. ${csa.title}`);
            console.log(`   ID: ${csa._id}`);
            console.log(`   Slug: ${csa.slug?.current || 'MISSING'}`);
            console.log(`   URL: /category/cxo-interview/${csa.slug?.current}`);
            console.log(`   Image: ${csa.mainImage ? '✅ Present' : '❌ Missing'}`);
            console.log(`   Categories: ${csa.categories?.join(', ') || 'None'}`);
            console.log(`   Published: ${csa.publishedAt || 'Not set'}`);
        });

        console.log('\n' + '='.repeat(100));
        console.log('\n📋 Summary for Spotlight Configuration:\n');

        csaArticles.forEach((csa: any, i: number) => {
            console.log(`${i + 1}. ID: ${csa._id}`);
            console.log(`   Slug: ${csa.slug?.current}`);
            console.log(`   For URL: /category/cxo-interview/${csa.slug?.current}\n`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

verifyCSAArticles();
