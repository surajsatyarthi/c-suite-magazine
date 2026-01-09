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

async function auditCXOInterviewCategory() {
    console.log('📋 COMPLETE AUDIT: CXO Interview Category Articles\n');
    console.log('═'.repeat(100) + '\n');

    // Get CXO Interview category ID
    const cxoCategory = await client.fetch(`
        *[_type == "category" && slug.current == "cxo-interview"][0]{
            _id,
            title,
            slug
        }
    `);

    if (!cxoCategory) {
        console.log('❌ CXO Interview category not found!\n');
        return;
    }

    console.log(`Category: ${cxoCategory.title} (ID: ${cxoCategory._id})\n`);

    // 1. Get all CSA articles
    console.log('1️⃣  CSA ARTICLES (Company Sponsored)');
    console.log('─'.repeat(100));
    const csaArticles = await client.fetch(`
        *[_type == "csa" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
            _id,
            title,
            slug,
            "categoryRef": category->slug.current,
            "categories": categories[]->slug.current
        }
    `);

    console.log(`Total CSA articles: ${csaArticles.length}\n`);
    csaArticles.forEach((article: any, i: number) => {
        const url = `https://csuitemagazine.global/category/company-sponsored/${article.slug?.current || 'MISSING_SLUG'}`;
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   URL: ${url}`);
        console.log(`   Display Category: ${article.categoryRef || 'Not set'}`);
        console.log(`   Internal Categories: ${article.categories?.join(', ') || 'None'}\n`);
    });

    // 2. Get spotlight config items
    console.log('\n2️⃣  SPOTLIGHT ARTICLES (Homepage Featured)');
    console.log('─'.repeat(100));
    const spotlightConfig = await client.fetch(`
        *[_type == "spotlightConfig"][0]{
            items[]->{
                _id,
                _type,
                title,
                slug,
                articleType,
                "categoryNames": categories[]->title,
                "categorySlugs": categories[]->slug.current
            }
        }
    `);

    const spotlightItems = spotlightConfig?.items || [];
    console.log(`Total Spotlight articles: ${spotlightItems.length}\n`);
    spotlightItems.forEach((article: any, i: number) => {
        const categorySlug = article.categorySlugs?.[0] || 'unknown';
        const url = article._type === 'csa'
            ? `https://csuitemagazine.global/category/company-sponsored/${article.slug?.current || 'MISSING_SLUG'}`
            : `https://csuitemagazine.global/category/${categorySlug}/${article.slug?.current || 'MISSING_SLUG'}`;

        console.log(`${i + 1}. ${article.title}`);
        console.log(`   URL: ${url}`);
        console.log(`   Type: ${article._type}`);
        console.log(`   Article Type: ${article.articleType || 'spotlight'}`);
        console.log(`   Categories: ${article.categoryNames?.join(', ') || 'None'}\n`);
    });

    // 3. Get interview variant articles
    console.log('\n3️⃣  INTERVIEW VARIANT ARTICLES');
    console.log('─'.repeat(100));
    const interviewArticles = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**")) && articleVariant == "interview"] | order(_createdAt desc) {
            _id,
            title,
            slug,
            articleType,
            "categoryNames": categories[]->title,
            "categorySlugs": categories[]->slug.current,
            isHidden
        }
    `);

    console.log(`Total Interview variant articles: ${interviewArticles.length}\n`);
    interviewArticles.forEach((article: any, i: number) => {
        const categorySlug = article.categorySlugs?.[0] || 'unknown';
        const url = `https://csuitemagazine.global/category/${categorySlug}/${article.slug?.current || 'MISSING_SLUG'}`;

        console.log(`${i + 1}. ${article.title}`);
        console.log(`   URL: ${url}`);
        console.log(`   Article Type: ${article.articleType || 'N/A'}`);
        console.log(`   Categories: ${article.categoryNames?.join(', ') || 'None'}`);
        console.log(`   Hidden: ${article.isHidden ? 'YES ⚠️' : 'NO'}\n`);
    });

    // 4. Get ALL articles in CXO Interview category
    console.log('\n4️⃣  ALL ARTICLES REFERENCING CXO INTERVIEW CATEGORY');
    console.log('─'.repeat(100));
    const allCXOArticles = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**")) && references($categoryId)] | order(_createdAt desc) {
            _id,
            title,
            slug,
            articleVariant,
            articleType,
            "categorySlugs": categories[]->slug.current,
            isHidden
        }
    `, { categoryId: cxoCategory._id });

    console.log(`Total articles in CXO Interview category: ${allCXOArticles.length}\n`);
    allCXOArticles.forEach((article: any, i: number) => {
        const categorySlug = article.categorySlugs?.[0] || 'cxo-interview';
        const url = `https://csuitemagazine.global/category/${categorySlug}/${article.slug?.current || 'MISSING_SLUG'}`;

        console.log(`${i + 1}. ${article.title}`);
        console.log(`   URL: ${url}`);
        console.log(`   Variant: ${article.articleVariant || 'N/A'}`);
        console.log(`   Article Type: ${article.articleType || 'N/A'}`);
        console.log(`   Hidden: ${article.isHidden ? 'YES ⚠️' : 'NO'}\n`);
    });

    // Summary
    console.log('\n═'.repeat(100));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(100));
    console.log(`CSA Articles:                    ${csaArticles.length}`);
    console.log(`Spotlight Articles:              ${spotlightItems.length}`);
    console.log(`Interview Variant Articles:      ${interviewArticles.length}`);
    console.log(`Total in CXO Interview Category: ${allCXOArticles.length}`);
    console.log('\nExpected on site: CSA (3) + Spotlight (16) + Interview variant (few) = ~20-25 articles');
    console.log('═'.repeat(100) + '\n');
}

auditCXOInterviewCategory().catch(console.error);
