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

async function checkAllSpotlightArticles() {
    console.log('🔍 Checking ALL Spotlight Articles Thoroughly\n');

    try {
        // Get ALL spotlight article IDs
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);

        if (!spotlight || !spotlight.items) {
            console.log('⚠️  No spotlight config found\n');
            return;
        }

        const spotlightIds = spotlight.items.map((item: any) => item._ref);
        console.log(`Total spotlight articles: ${spotlightIds.length}\n`);

        // Fetch ALL spotlight articles including Angelina
        const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

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
                author-> {
                    _id,
                    name
                },
                excerpt,
                "bodyLength": length(body),
                "hasBody": defined(body),
                "isAngelina": _id == $angelinaId
            } | order(isAngelina desc, title asc)
        `, { ids: spotlightIds, angelinaId });

        console.log(`Fetched ${articles.length} articles\n`);
        console.log('='.repeat(100));

        // Detailed listing
        articles.forEach((article: any, i: number) => {
            const marker = article.isAngelina ? '📌 [ANGELINA]' : `${i}.`;
            console.log(`\n${marker} ${article.title}`);
            console.log('-'.repeat(100));
            console.log(`   Type: ${article._type}`);
            console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
            console.log(`   Hero Image: ${article.heroImage ? `✅ Present (${article.heroImage.asset?.url?.substring(0, 70)}...)` : '❌ MISSING'}`);
            console.log(`   Author: ${article.author?.name || '❌ MISSING'}`);
            console.log(`   Categories: ${article.categories?.join(', ') || 'None'}`);
            console.log(`   Excerpt: ${article.excerpt ? '✅ Present' : '❌ Missing'}`);
            console.log(`   Body: ${article.hasBody ? `✅ Present (${article.bodyLength} blocks)` : '❌ Missing'}`);
        });

        console.log('\n' + '='.repeat(100));
        console.log('\n📊 COMPLETE ANALYSIS:\n');

        const angelinaArticle = articles.find((a: any) => a.isAngelina);
        const spotlightArticles = articles.filter((a: any) => !a.isAngelina);

        // Count statistics
        const stats = {
            total: spotlightArticles.length,
            withHeroImage: spotlightArticles.filter((a: any) => a.heroImage).length,
            withAuthor: spotlightArticles.filter((a: any) => a.author?.name).length,
            withExcerpt: spotlightArticles.filter((a: any) => a.excerpt).length,
            withBody: spotlightArticles.filter((a: any) => a.hasBody).length,
            withCategories: spotlightArticles.filter((a: any) => a.categories?.length > 0).length
        };

        console.log(`SPOTLIGHT ARTICLES (${stats.total} total):`);
        console.log(`   Hero Images: ${stats.withHeroImage}/${stats.total} (${((stats.withHeroImage / stats.total) * 100).toFixed(0)}%)`);
        console.log(`   Authors: ${stats.withAuthor}/${stats.total} (${((stats.withAuthor / stats.total) * 100).toFixed(0)}%)`);
        console.log(`   Excerpts: ${stats.withExcerpt}/${stats.total} (${((stats.withExcerpt / stats.total) * 100).toFixed(0)}%)`);
        console.log(`   Body Content: ${stats.withBody}/${stats.total} (${((stats.withBody / stats.total) * 100).toFixed(0)}%)`);
        console.log(`   Categories: ${stats.withCategories}/${stats.total} (${((stats.withCategories / stats.total) * 100).toFixed(0)}%)\n`);

        if (angelinaArticle) {
            console.log('ANGELINA USANOVA ARTICLE:');
            console.log(`   Hero Image: ${angelinaArticle.heroImage ? '✅ Present' : '❌ MISSING'}`);
            console.log(`   Author: ${angelinaArticle.author?.name || '❌ MISSING'}`);
            console.log(`   Excerpt: ${angelinaArticle.excerpt ? '✅ Present' : '❌ Missing'}`);
            console.log(`   Body Content: ${angelinaArticle.hasBody ? `✅ Present (${angelinaArticle.bodyLength} blocks)` : '❌ Missing'}`);
            console.log(`   Categories: ${angelinaArticle.categories?.length > 0 ? `✅ ${angelinaArticle.categories.join(', ')}` : '❌ Missing'}\n`);

            // Issues
            console.log('🎯 ISSUES FOUND:\n');
            const issues = [];

            if (!angelinaArticle.heroImage && stats.withHeroImage === stats.total) {
                issues.push(`❌ MISSING hero image (${stats.total}/${stats.total} other spotlight articles have it)`);
            } else if (angelinaArticle.heroImage && stats.withHeroImage < stats.total) {
                issues.push(`✅ Has hero image (${stats.withHeroImage}/${stats.total} other spotlight articles have it)`);
            } else if (angelinaArticle.heroImage) {
                issues.push(`✅ Has hero image`);
            } else {
                issues.push(`❌ MISSING hero image`);
            }

            if (!angelinaArticle.author?.name && stats.withAuthor === stats.total) {
                issues.push(`❌ MISSING author (${stats.total}/${stats.total} other spotlight articles have it)`);
            } else if (angelinaArticle.author?.name && stats.withAuthor < stats.total) {
                issues.push(`✅ Has author (${stats.withAuthor}/${stats.total} other spotlight articles have it)`);
            } else if (angelinaArticle.author?.name) {
                issues.push(`✅ Has author: ${angelinaArticle.author.name}`);
            } else {
                issues.push(`❌ MISSING author`);
            }

            issues.forEach(issue => console.log(`   ${issue}`));
            console.log('\n');

            // Articles missing hero images
            const missingHero = spotlightArticles.filter((a: any) => !a.heroImage);
            if (missingHero.length > 0) {
                console.log(`⚠️  Spotlight articles missing hero images (${missingHero.length}):`);
                missingHero.forEach((a: any) => console.log(`   - ${a.title}`));
                console.log('\n');
            }

            // Articles missing authors
            const missingAuthor = spotlightArticles.filter((a: any) => !a.author?.name);
            if (missingAuthor.length > 0) {
                console.log(`⚠️  Spotlight articles missing authors (${missingAuthor.length}):`);
                missingAuthor.forEach((a: any) => console.log(`   - ${a.title}`));
                console.log('\n');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkAllSpotlightArticles();
