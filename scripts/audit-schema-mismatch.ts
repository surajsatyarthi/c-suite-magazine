import * as dotenv from 'dotenv';
import * as path from 'path';
// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function auditSchemas() {
    console.log('🔍 Auditing Data vs Schema Mismatches\n');

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
        console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not defined.');
        return;
    }

    // Check CSA articles for unknown fields
    console.log('📊 CSA Articles (Company Sponsored)');
    console.log('─'.repeat(60));
    const csaArticles = await client.fetch(`
        *[_type == "csa" && !(_id in path("drafts.**"))][0...3] {
            _id,
            title,
            legacySlug,
            readTime,
            category,
            categories,
            writer,
            author
        }
    `);
    console.log(`Sample size: ${csaArticles.length} articles\n`);
    csaArticles.forEach((article: any, i: number) => {
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   legacySlug: ${article.legacySlug || 'NOT SET'}`);
        console.log(`   readTime: ${article.readTime || 'NOT SET'}`);
        console.log(`   category (single): ${article.category ? JSON.stringify(article.category) : 'NOT SET'}`);
        console.log(`   categories (array): ${article.categories ? `[${article.categories.length} items]` : 'NOT SET'}`);
        console.log(`   writer: ${article.writer ? 'SET' : 'NOT SET'}`);
        console.log(`   author: ${article.author ? 'SET' : 'NOT SET'}\n`);
    });

    // Check normal articles for missing _key
    console.log('\n📊 Normal Articles (post type)');
    console.log('─'.repeat(60));
    const posts = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**"))][0...3] {
            _id,
            title,
            "categoryCount": count(categories),
            "categoriesHaveKeys": categories[]._key,
            "bodyItemCount": count(body),
            "bodyItemsHaveKeys": body[]._key,
            author,
            writer
        }
    `);
    console.log(`Sample size: ${posts.length} articles\n`);
    posts.forEach((post: any, i: number) => {
        console.log(`${i + 1}. ${post.title}`);
        console.log(`   Categories: ${post.categoryCount} items`);
        console.log(`   Category keys present: ${post.categoriesHaveKeys ? post.categoriesHaveKeys.filter((k: any) => k).length : 0}/${post.categoryCount}`);
        console.log(`   Body blocks: ${post.bodyItemCount} items`);
        console.log(`   Body keys present: ${post.bodyItemsHaveKeys ? post.bodyItemsHaveKeys.filter((k: any) => k).length : 0}/${post.bodyItemCount}`);
        console.log(`   writer: ${post.writer ? 'SET' : 'NOT SET'}`);
        console.log(`   author: ${post.author ? 'SET' : 'NOT SET'}\n`);
    });

    // Check spotlight config
    console.log('\n📊 Spotlight Articles');
    console.log('─'.repeat(60));
    const spotlight = await client.fetch(`
        *[_type == "spotlightConfig"][0] {
            _id,
            title,
            "itemCount": count(items),
            "itemsHaveKeys": items[]._key
        }
    `);
    if (spotlight) {
        console.log(`Spotlight config: ${spotlight.title}`);
        console.log(`   Items: ${spotlight.itemCount}`);
        console.log(`   Keys present: ${spotlight.itemsHaveKeys ? spotlight.itemsHaveKeys.filter((k: any) => k).length : 0}/${spotlight.itemCount}\n`);
    }

    console.log('\n✅ Audit Complete\n');
}

auditSchemas().catch(console.error);
