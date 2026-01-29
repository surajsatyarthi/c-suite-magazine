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

async function findMissingArticles() {
    console.log('🔍 Finding Missing Articles from CXO Interview Category Page\n');

    // Articles shown on live site (from browser check)
    const liveArticleTitles = [
        "Dean Fealk",
        "Erin Krueger",
        "Brianne Howey",
        "Supreet Nagi",
        "Swami Aniruddha",
        "John Zangardi",
        "Stoyana Natseva",
        "Pankaj Bansal",
        "John Farahi's Vision for Entertainment Innovation",
        "Bob Bagby's Vision for Entertainment Innovation",
        "Building Entertainment Empires: Lester Elder's Executive Vision",
        "David Prosser's Strategic Fitness Revolution",
        "Harjinder Shergill Chima's Strategic Vision",
        "Dr. Basma Ghandourah",
        "Cal Riley",
        "A Global Mission Taking Root in America: Angelina Usanova's Bold New Era",
        "A Global Mission, Anchored in America: Angelina Usanova's Upcoming Endeavors",
        "Benjamin Borketey",
        "Bryan Smeltzer",
        "Azhan Shafriman Hanif's Strategic Vision"
    ];

    // Get CXO Interview category
    const cxoCategory = await client.fetch(`
        *[_type == "category" && slug.current == "cxo-interview"][0]._id
    `);

    // Get all articles in CXO Interview category
    const allArticles = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**")) && references($categoryId)] {
            _id,
            title,
            slug,
            isHidden,
            publishedAt,
            _createdAt,
            _updatedAt
        }
    `, { categoryId: cxoCategory });

    console.log(`Total articles in database: ${allArticles.length}`);
    console.log(`Total articles on live site: ${liveArticleTitles.length}\n`);

    // Find missing articles
    const missingArticles = allArticles.filter((article: any) => {
        const title = article.title;
        // Check for partial match since live site might show shortened titles
        return !liveArticleTitles.some(liveTitle =>
            liveTitle.includes(title) || title.includes(liveTitle)
        );
    });

    console.log(`Missing articles: ${missingArticles.length}\n`);
    console.log('═'.repeat(100) + '\n');

    missingArticles.forEach((article: any, i: number) => {
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   ID: ${article._id}`);
        console.log(`   Slug: ${article.slug?.current || '❌ NO SLUG'}`);
        console.log(`   Hidden: ${article.isHidden ? '⚠️  YES' : 'NO'}`);
        console.log(`   Published At: ${article.publishedAt || 'Not set'}`);
        console.log(`   Created: ${article._createdAt}`);
        console.log(`   Updated: ${article._updatedAt}\n`);
    });

    // Check the category page query logic
    console.log('\n📋 Checking Category Page Query Logic\n');
    console.log('Looking at what query the page uses...\n');

    // Simulate the typical category page query
    const pageQuery = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**")) && references($categoryId) && !isHidden] | order(publishedAt desc, _createdAt desc) {
            _id,
            title,
            slug
        }
    `, { categoryId: cxoCategory });

    console.log(`Articles returned by typical category page query: ${pageQuery.length}\n`);

    if (pageQuery.length !== liveArticleTitles.length) {
        console.log(`⚠️  Mismatch! Query returns ${pageQuery.length} but live site shows ${liveArticleTitles.length}\n`);
    }

    // Check if missing articles have publishedAt dates
    const noPublishDate = missingArticles.filter((a: any) => !a.publishedAt);
    if (noPublishDate.length > 0) {
        console.log(`\n⚠️  ${noPublishDate.length} missing article(s) have no publishedAt date:`);
        noPublishDate.forEach((a: any) => console.log(`   - ${a.title}`));
    }
}

findMissingArticles().catch(console.error);
