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

async function compareArticleStructure() {
    console.log('📊 Complete Article Structure Comparison\n');

    const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

    try {
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);
        const spotlightIds = spotlight.items.map((item: any) => item._ref);

        const articles = await client.fetch(`
            *[_id in $ids] {
                _id,
                title,
                slug,
                "primaryCategory": categories[0]->{ title, slug },
                "allCategories": categories[]->title,
                heroImage,
                mainImage,
                spotlightImage,
                author,
                "isAngelina": _id == $angelinaId
            } | order(isAngelina desc, title asc)
        `, { ids: spotlightIds, angelinaId });

        console.log('='.repeat(120));
        console.log('COMPARISON: URL Structure and Categories\n');
        console.log('='.repeat(120));

        articles.forEach((article: any, i: number) => {
            const marker = article.isAngelina ? '\n📌 ANGELINA (YOUR ARTICLE)' : `\n${i}.`;
            const categorySlug = article.primaryCategory?.slug?.current || 'unknown';
            const articleSlug = article.slug?.current || 'unknown';
            const fullUrl = `/category/${categorySlug}/${articleSlug}`;

            console.log(`${marker} ${article.title}`);
            console.log('-'.repeat(120));
            console.log(`   URL: https://csuitemagazine.global${fullUrl}`);
            console.log(`   Primary Category: ${article.primaryCategory?.title || 'Missing'}`);
            console.log(`   All Categories: ${article.allCategories?.join(', ') || 'None'}`);
            console.log(`   Images: heroImage=${article.heroImage ? '✅' : '❌'}, mainImage=${article.mainImage ? '✅' : '❌'}, spotlightImage=${article.spotlightImage ? '✅' : '❌'}`);
            console.log(`   Author: ${article.author ? '✅' : '❌'}`);
        });

        console.log('\n' + '='.repeat(120));
        console.log('\n✅ VERIFICATION:\n');

        const angelina = articles.find((a: any) => a.isAngelina);
        const others = articles.filter((a: any) => !a.isAngelina);

        const otherCategories = others.map((a: any) => a.primaryCategory?.title);
        const allSameCat = otherCategories.every((cat: string) => cat === otherCategories[0]);

        if (allSameCat) {
            console.log(`   Other articles: ALL under "${otherCategories[0]}" category ✅`);
        } else {
            console.log(`   Other articles: Mixed categories ⚠️`);
        }

        if (angelina?.primaryCategory?.title === otherCategories[0]) {
            console.log(`   Angelina article: MATCHES others (${angelina.primaryCategory.title}) ✅`);
        } else {
            console.log(`   Angelina article: DIFFERENT from others (${angelina?.primaryCategory?.title} vs ${otherCategories[0]}) ❌`);
        }

        console.log('\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

compareArticleStructure();
