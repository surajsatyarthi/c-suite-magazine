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

async function verifyReadTimeStatus() {
    console.log('🔍 Direct Sanity Query - Verifying Current State\n');

    // Query 1: Total articles
    const total = await client.fetch(`count(*[_type == "post" && !(_id in path("drafts.**"))])`);
    console.log(`Total articles in database: ${total}`);

    // Query 2: Articles WITH readTime
    const withReadTime = await client.fetch(`count(*[_type == "post" && !(_id in path("drafts.**")) && defined(readTime)])`);
    console.log(`Articles WITH readTime field: ${withReadTime}`);

    // Query 3: Articles WITHOUT readTime
    const withoutReadTime = await client.fetch(`count(*[_type == "post" && !(_id in path("drafts.**")) && !defined(readTime)])`);
    console.log(`Articles WITHOUT readTime field: ${withoutReadTime}`);

    // Query 4: Sample of articles with their readTime values
    const sample = await client.fetch(`
    *[_type == "post" && !(_id in path("drafts.**"))] | order(_updatedAt desc) [0...5] {
      title,
      readTime,
      _updatedAt
    }
  `);

    console.log('\n📊 Sample of 5 most recently updated articles:');
    sample.forEach((article: any, index: number) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   readTime: ${article.readTime !== undefined ? article.readTime + ' minutes' : 'NOT SET'}`);
        console.log(`   Last updated: ${new Date(article._updatedAt).toLocaleString()}`);
    });
}

verifyReadTimeStatus();
