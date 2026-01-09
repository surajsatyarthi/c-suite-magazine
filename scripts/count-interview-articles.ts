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

async function countInterviewArticles() {
    console.log('🔍 Counting Interview Articles\n');
    console.log('═'.repeat(80) + '\n');

    // 1. Count by articleVariant = 'interview'
    const variantInterviews = await client.fetch(`
        count(*[_type == "post" && !(_id in path("drafts.**")) && articleVariant == "interview"])
    `);

    // 2. Count by CXO Interview category
    const cxoCategoryId = await client.fetch(`
        *[_type == "category" && slug.current == "cxo-interview"][0]._id
    `);

    const categoryInterviews = cxoCategoryId ? await client.fetch(`
        count(*[_type == "post" && !(_id in path("drafts.**")) && references($categoryId)])
    `, { categoryId: cxoCategoryId }) : 0;

    // 3. Count CSA articles (all CSAs are interviews shown under CXO Interview)
    const csaCount = await client.fetch(`
        count(*[_type == "csa" && !(_id in path("drafts.**"))])
    `);

    // 4. Get hidden articles
    const hiddenInterviews = await client.fetch(`
        count(*[_type == "post" && !(_id in path("drafts.**")) && articleVariant == "interview" && isHidden == true])
    `);

    // 5. Total that should appear on site
    const totalVisible = variantInterviews - hiddenInterviews + csaCount;

    console.log('📊 SANITY DATABASE COUNTS:');
    console.log('─'.repeat(80));
    console.log(`Interview variant articles (post type):        ${variantInterviews}`);
    console.log(`  - Hidden:                                    ${hiddenInterviews}`);
    console.log(`  - Visible:                                   ${variantInterviews - hiddenInterviews}`);
    console.log(`\nCSA articles (all count as interviews):        ${csaCount}`);
    console.log(`\nArticles in CXO Interview category:            ${categoryInterviews}`);
    console.log('\n' + '─'.repeat(80));
    console.log(`TOTAL EXPECTED ON SITE:                        ${totalVisible}`);
    console.log('═'.repeat(80) + '\n');

    // Get sample of interview articles
    const sampleInterviews = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**")) && articleVariant == "interview"][0...5]{
            title,
            slug,
            isHidden,
            "categoryNames": categories[]->title
        }
    `);

    console.log('\n📄 SAMPLE INTERVIEW ARTICLES (first 5):');
    console.log('─'.repeat(80));
    sampleInterviews.forEach((article: any, i: number) => {
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
        console.log(`   Hidden: ${article.isHidden ? 'YES' : 'NO'}`);
        console.log(`   Categories: ${article.categoryNames?.join(', ') || 'None'}\n`);
    });

    // Get sample CSAs
    const sampleCSAs = await client.fetch(`
        *[_type == "csa" && !(_id in path("drafts.**"))][0...3]{
            title,
            slug,
            "categoryName": category->title
        }
    `);

    console.log('\n📝 SAMPLE CSA ARTICLES (first 3):');
    console.log('─'.repeat(80));
    sampleCSAs.forEach((article: any, i: number) => {
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
        console.log(`   Display Category: ${article.categoryName || 'Not set'}\n`);
    });
}

countInterviewArticles().catch(console.error);
