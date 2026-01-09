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

async function compareAngelinaWithSpotlight() {
    console.log('🔍 Comparing Angelina Article with Other Spotlight Articles\n');

    try {
        // Get articles from spotlight
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);

        if (!spotlight || !spotlight.items) {
            console.log('⚠️  No spotlight config found\n');
            return;
        }

        // Get the article IDs from spotlight
        const spotlightIds = spotlight.items.map((item: any) => item._ref);

        // Fetch spotlight articles with Angelina's
        const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';
        const allIds = [angelinaId, ...spotlightIds.slice(0, 4)]; // Angelina + first 4 spotlight

        const articles = await client.fetch(`
            *[_id in $ids] {
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
                "hasBody": defined(body),
                "isAngelina": _id == $angelinaId
            } | order(isAngelina desc, title asc)
        `, { ids: allIds, angelinaId });

        console.log(`Found ${articles.length} articles for comparison\n`);
        console.log('='.repeat(80));

        articles.forEach((article: any, i: number) => {
            const marker = article.isAngelina ? '📌 [ANGELINA]' : `${i}.`;
            console.log(`\n${marker} ${article.title}`);
            console.log('-'.repeat(80));
            console.log(`   Type: ${article._type}`);
            console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
            console.log(`   Published: ${article.publishedAt || 'Not set'}`);
            console.log(`   Hero Image: ${article.heroImage ? '✅ Present' : '❌ Missing'}`);
            console.log(`   Categories: ${article.categories?.join(', ') || 'None'}`);
            console.log(`   Author: ${article.authorName || 'Not set'}`);
            console.log(`   Excerpt: ${article.excerpt ? '✅ Present' : '❌ Missing'}`);
            console.log(`   Body: ${article.hasBody ? `✅ Present (${article.bodyLength} blocks)` : '❌ Missing'}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('\n📊 Structure Consistency Check:\n');

        const angelinaArticle = articles.find((a: any) => a.isAngelina);
        const otherArticles = articles.filter((a: any) => !a.isAngelina);

        if (angelinaArticle && otherArticles.length > 0) {
            // Check what other articles have
            const stats = {
                heroImage: otherArticles.filter((a: any) => a.heroImage).length,
                excerpt: otherArticles.filter((a: any) => a.excerpt).length,
                body: otherArticles.filter((a: any) => a.hasBody).length,
                author: otherArticles.filter((a: any) => a.authorName).length,
                total: otherArticles.length
            };

            console.log('Other Spotlight Articles:');
            console.log(`   Hero Images: ${stats.heroImage}/${stats.total} have them`);
            console.log(`   Excerpts: ${stats.excerpt}/${stats.total} have them`);
            console.log(`   Body Content: ${stats.body}/${stats.total} have them`);
            console.log(`   Authors: ${stats.author}/${stats.total} have them\n`);

            console.log('Angelina Usanova Article:');
            console.log(`   Hero Image: ${angelinaArticle.heroImage ? '✅ Present' : '❌ Missing'}`);
            console.log(`   Excerpt: ${angelinaArticle.excerpt ? '✅ Present' : '❌ Missing'}`);
            console.log(`   Body Content: ${angelinaArticle.hasBody ? `✅ Present (${angelinaArticle.bodyLength} blocks)` : '❌ Missing'}`);
            console.log(`   Author: ${angelinaArticle.authorName ? `✅ Present (${angelinaArticle.authorName})` : '❌ Missing'}`);
            console.log(`   Categories: ${angelinaArticle.categories?.length > 0 ? `✅ ${angelinaArticle.categories.join(', ')}` : '❌ Missing'}\n`);

            // Consistency evaluation
            console.log(`🎯 Consistency Evaluation:\n`);

            const issues = [];
            if (!angelinaArticle.heroImage) issues.push('❌ Missing hero image');
            else console.log('✅ Hero image: Present and uploaded');

            if (!angelinaArticle.excerpt) issues.push('⚠️  Missing excerpt (common in some articles)');
            else console.log('✅ Excerpt: Present');

            if (!angelinaArticle.hasBody) issues.push('❌ Missing body content');
            else console.log('✅ Body content: Present');

            if (!angelinaArticle.authorName) issues.push('⚠️  Missing author');
            else console.log('✅ Author: Present');

            if (!angelinaArticle.categories || angelinaArticle.categories.length === 0) {
                issues.push('❌ Missing categories');
            } else {
                console.log('✅ Categories: Present');
            }

            console.log('\n');
            if (issues.length === 0) {
                console.log('✨ Perfect! Article structure matches other spotlight articles.\n');
            } else {
                console.log(`📋 Notes:\n${issues.map(i => `   ${i}`).join('\n')}\n`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

compareAngelinaWithSpotlight();
