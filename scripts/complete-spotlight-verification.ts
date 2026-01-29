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

async function completeSpotlightVerification() {
    console.log('🔬 COMPLETE SPOTLIGHT VERIFICATION - Checking Correct Fields\n');

    try {
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);
        const spotlightIds = spotlight.items.map((item: any) => item._ref);
        const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

        console.log(`Total spotlight articles: ${spotlightIds.length}\n`);

        // Fetch ALL articles with ALL image fields
        const articles = await client.fetch(`
            *[_id in $ids] {
                _id,
                title,
                slug,
                heroImage { asset-> { _id, url } },
                mainImage { asset-> { _id, url } },
                spotlightImage { asset-> { _id, url } },
                author-> { name },
                "isAngelina": _id == $angelinaId
            } | order(isAngelina desc, title asc)
        `, { ids: spotlightIds, angelinaId });

        console.log('='.repeat(120));
        console.log('\n📋 ALL SPOTLIGHT ARTICLES - DETAILED IMAGE FIELD AUDIT:\n');
        console.log('='.repeat(120));

        articles.forEach((article: any, i: number) => {
            const marker = article.isAngelina ? '\n📌 [ANGELINA USANOVA - YOUR MANUALLY RESTORED ARTICLE]' : `\n${i}.`;
            console.log(`${marker} ${article.title}`);
            console.log('-'.repeat(120));
            console.log(`   Slug: /${article.slug?.current || 'N/A'}`);
            console.log(`   heroImage: ${article.heroImage ? `✅ Present` : '❌ Missing'}`);
            console.log(`   mainImage: ${article.mainImage ? `✅ Present` : '❌ Missing'} ${article.mainImage ? '(USED BY SPOTLIGHT)' : ''}`);
            console.log(`   spotlightImage: ${article.spotlightImage ? `✅ Present` : '❌ Missing'} ${article.spotlightImage ? '(USED BY SPOTLIGHT)' : ''}`);
            console.log(`   author: ${article.author?.name || '❌ Missing'}`);
        });

        console.log('\n' + '='.repeat(120));
        console.log('\n📊 COMPREHENSIVE STATISTICS:\n');

        const angelina = articles.find((a: any) => a.isAngelina);
        const others = articles.filter((a: any) => !a.isAngelina);

        const stats = {
            total: others.length,
            heroImage: others.filter((a: any) => a.heroImage).length,
            mainImage: others.filter((a: any) => a.mainImage).length,
            spotlightImage: others.filter((a: any) => a.spotlightImage).length,
            author: others.filter((a: any) => a.author?.name).length,
        };

        console.log(`OTHER SPOTLIGHT ARTICLES (${stats.total} total):`);
        console.log(`   heroImage: ${stats.heroImage}/${stats.total} (${((stats.heroImage / stats.total) * 100).toFixed(0)}%)`);
        console.log(`   mainImage: ${stats.mainImage}/${stats.total} (${((stats.mainImage / stats.total) * 100).toFixed(0)}%) ⭐ PRIMARY SPOTLIGHT FIELD`);
        console.log(`   spotlightImage: ${stats.spotlightImage}/${stats.total} (${((stats.spotlightImage / stats.total) * 100).toFixed(0)}%) ⭐ PRIMARY SPOTLIGHT FIELD`);
        console.log(`   author: ${stats.author}/${stats.total} (${((stats.author / stats.total) * 100).toFixed(0)}%)\n`);

        if (angelina) {
            console.log(`ANGELINA USANOVA ARTICLE:`);
            console.log(`   heroImage: ${angelina.heroImage ? '✅ Present' : '❌ Missing'}`);
            console.log(`   mainImage: ${angelina.mainImage ? '✅ Present' : '❌ Missing'} ${angelina.mainImage ? '⭐ SPOTLIGHT READY' : '❌ NEEDS THIS'}`);
            console.log(`   spotlightImage: ${angelina.spotlightImage ? '✅ Present' : '❌ Missing'} ${angelina.spotlightImage ? '⭐ SPOTLIGHT READY' : '❌ NEEDS THIS'}`);
            console.log(`   author: ${angelina.author?.name || '❌ Missing'}\n`);

            console.log('🎯 FINAL VERDICT:\n');

            const hasSpotlightImage = angelina.mainImage || angelina.spotlightImage;

            if (hasSpotlightImage) {
                console.log('   ✅ Angelina article HAS spotlight images (mainImage or spotlightImage)');
                console.log('   ✅ Article will display properly in C-Suite Spotlight section');
            } else {
                console.log('   ❌ Angelina article MISSING spotlight images');
                console.log('   ❌ Will fallback to /Featured section/ file');
            }

            if (angelina.heroImage) {
                console.log('   ✅ Article has heroImage for individual article page');
            }

            if (!angelina.author?.name) {
                const othersMissingAuthor = stats.total - stats.author;
                if (othersMissingAuthor === stats.total) {
                    console.log(`   ℹ️  Missing author (but ALL ${stats.total} other spotlight articles are also missing authors)`);
                } else {
                    console.log(`   ⚠️  Missing author (${stats.author}/${stats.total} other articles have authors)`);
                }
            }

            console.log('\n');
        }

        // Show articles missing spotlight images
        const missingSpotlight = others.filter((a: any) => !a.mainImage && !a.spotlightImage);
        if (missingSpotlight.length > 0) {
            console.log(`⚠️  Other spotlight articles missing BOTH mainImage AND spotlightImage (${missingSpotlight.length}):`);
            missingSpotlight.forEach((a: any) => console.log(`   - ${a.title}`));
            console.log('\n');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

completeSpotlightVerification();
