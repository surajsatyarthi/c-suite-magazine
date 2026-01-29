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

async function verifyCXOCategoryPage() {
    console.log('🔍 Verifying CXO Interview Category Page\n');
    console.log('='.repeat(80));

    // Get CXO Interview category
    const category = await client.fetch(`*[_type == "category" && title == "CXO Interview"][0] { _id, title, slug }`);

    if (!category) {
        console.log('❌ Category not found\n');
        return;
    }

    console.log(`Category: ${category.title}`);
    console.log(`URL: https://csuitemagazine.global/category/${category.slug.current}\n`);
    console.log('='.repeat(80));

    // Get all articles in this category
    const articles = await client.fetch(
        `*[_type in ["post", "csa"] && references($categoryId)] | order(publishedAt desc) {
            _id,
            _type,
            title,
            slug,
            publishedAt
        }`,
        { categoryId: category._id }
    );

    console.log(`\nTotal articles: ${articles.length}\n`);

    // Break down by type
    const posts = articles.filter(a => a._type === 'post');
    const csas = articles.filter(a => a._type === 'csa');

    console.log(`Regular posts: ${posts.length}`);
    console.log(`CSA articles: ${csas.length}\n`);

    console.log('='.repeat(80));
    console.log('\n✅ All articles will appear at:\n');
    console.log(`   https://csuitemagazine.global/category/cxo-interview\n`);

    // Check specifically for the 10 we just updated
    console.log('='.repeat(80));
    console.log('\n📋 Verifying Recently Updated Articles:\n');

    const recentlyUpdated = [
        'shrikant-vaidya-chairman-indianoil',
        'elon-musk-building-future-civilization-scale',
        'ratan-tata-legacy-ethical-leadership',
        'bhavesh-aggarwal-india-electric-ai-maverick',
        'ritesh-agarwal-billion-dollar-hostel-kid-rewrote-global-hospitality',
        'amin-nasser-steady-hand-guiding-energy-next-chapter',
        'chamath-palihapitiya-spac-king-climate-tech-rebel',
        'yi-he-village-roots-co-ceo-crypto-global-gateway',
        'mohamed-alabbar-dubai-master-builder-urban-innovation',
        'murray-auchincloss-pragmatic-reset-steering-bp-value'
    ];

    let foundCount = 0;
    for (const slug of recentlyUpdated) {
        const found = articles.some(a => a.slug.current === slug);
        if (found) {
            foundCount++;
            console.log(`✅ ${slug}`);
        } else {
            console.log(`❌ ${slug}`);
        }
    }

    console.log(`\n${foundCount}/10 recently updated articles found in category\n`);
}

verifyCXOCategoryPage();
