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

async function compareSpotlightArticles() {
    console.log('🔍 Comparing Spotlight Article Structures\n');

    // Fetch spotlight articles including Angelina's
    const spotlightTitles = [
        "A Global Mission, Anchored in America: Angelina Usanova's Upcoming Endeavors",
        "Benjamin Borketey",
        "Bill Faruki",
        "Brianne Howey",
        "Bryan Smeltzer"
    ];

    const articles = await client.fetch(`
        *[_type in ["post", "csa"] && title in $titles] {
            _id,
            _type,
            title,
            slug,
            publishedAt,
            heroImage {
                asset-> {
                    _id,
                    url
                }
            },
            "categories": categories[]->title,
            "authorName": author->name,
            excerpt,
            "bodyLength": length(body),
            "hasBody": defined(body)
        } | order(title asc)
    `, { titles: spotlightTitles });

    console.log(`Found ${articles.length} spotlight articles\n`);
    console.log('='.repeat(80));

    articles.forEach((article: any, i: number) => {
        console.log(`\n${i + 1}. ${article.title}`);
        console.log('-'.repeat(80));
        console.log(`   Type: ${article._type}`);
        console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
        console.log(`   Published: ${article.publishedAt || 'Not set'}`);
        console.log(`   Hero Image: ${article.heroImage ? '✅ Present' : '❌ Missing'}`);
        if (article.heroImage) {
            console.log(`   Image URL: ${article.heroImage.asset?.url?.substring(0, 60)}...`);
        }
        console.log(`   Categories: ${article.categories?.join(', ') || 'None'}`);
        console.log(`   Author: ${article.authorName || 'Not set'}`);
        console.log(`   Excerpt: ${article.excerpt ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Body: ${article.hasBody ? `✅ Present (${article.bodyLength} blocks)` : '❌ Missing'}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Structure Analysis:');

    const angelinaArticle = articles.find((a: any) => a.title.includes("Angelina Usanova"));
    const otherArticles = articles.filter((a: any) => !a.title.includes("Angelina Usanova"));

    if (angelinaArticle && otherArticles.length > 0) {
        const allHaveHeroImages = otherArticles.every((a: any) => a.heroImage);
        const allHaveExcerpts = otherArticles.every((a: any) => a.excerpt);
        const allHaveBody = otherArticles.every((a: any) => a.hasBody);
        const allHaveAuthors = otherArticles.every((a: any) => a.authorName);

        console.log('\nOther Spotlight Articles:');
        console.log(`   Hero Images: ${allHaveHeroImages ? '✅ All have them' : '⚠️  Some missing'}`);
        console.log(`   Excerpts: ${allHaveExcerpts ? '✅ All have them' : '⚠️  Some missing'}`);
        console.log(`   Body Content: ${allHaveBody ? '✅ All have them' : '⚠️  Some missing'}`);
        console.log(`   Authors: ${allHaveAuthors ? '✅ All have them' : '⚠️  Some missing'}`);

        console.log('\nAngelina Usanova Article:');
        console.log(`   Hero Image: ${angelinaArticle.heroImage ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Excerpt: ${angelinaArticle.excerpt ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Body Content: ${angelinaArticle.hasBody ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Author: ${angelinaArticle.authorName ? '✅ Present' : '❌ Missing'}`);
        console.log(`   Categories: ${angelinaArticle.categories?.length > 0 ? '✅ Present' : '❌ Missing'}`);

        console.log('\n🎯 Consistency Check:');
        const issues = [];
        if (!angelinaArticle.heroImage && allHaveHeroImages) issues.push('Missing hero image');
        if (!angelinaArticle.excerpt && allHaveExcerpts) issues.push('Missing excerpt');
        if (!angelinaArticle.hasBody && allHaveBody) issues.push('Missing body content');
        if (!angelinaArticle.authorName && allHaveAuthors) issues.push('Missing author');

        if (issues.length === 0) {
            console.log('   ✅ Article structure matches other spotlight articles!');
        } else {
            console.log(`   ⚠️  Issues found: ${issues.join(', ')}`);
        }
    }

    console.log('\n');
}

compareSpotlightArticles().catch(console.error);
