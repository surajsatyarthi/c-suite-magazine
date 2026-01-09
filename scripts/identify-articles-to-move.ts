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

async function identifyArticlesToMove() {
    console.log('🔍 Identifying Articles to Move to CXO Interview\n');
    console.log('='.repeat(100));

    // Get CXO Interview category ID
    const cxoCategory = await client.fetch(`*[_type == "category" && title == "CXO Interview"][0] { _id, title }`);

    if (!cxoCategory) {
        console.log('❌ CXO Interview category not found\n');
        return;
    }

    console.log(`Target Category: ${cxoCategory.title} (${cxoCategory._id})\n`);

    // Get all CSA articles
    const csaArticles = await client.fetch(`*[_type == "csa"] {
        _id,
        title,
        "categories": categories[]->{ _id, title },
        "primaryCategory": categories[0]->title
    }`);

    // Get spotlight articles
    const spotlightConfig = await client.fetch(`*[_id == "spotlightConfig"][0] {
        items[]-> {
            _id,
            _type,
            title,
            "categories": categories[]->{ _id, title },
            "primaryCategory": categories[0]->title
        }
    }`);
    const spotlightArticles = spotlightConfig.items.filter(item => item !== null && item._type === 'post');

    // Get industry juggernaut articles
    const juggernauts = [];
    const juggernautConfig = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`);

    if (juggernautConfig && juggernautConfig.items) {
        for (const item of juggernautConfig.items) {
            const slug = item.link.split('/').pop();
            const article = await client.fetch(
                `*[_type == "post" && slug.current == $slug][0] { 
                    _id, 
                    title,
                    "categories": categories[]->{ _id, title },
                    "primaryCategory": categories[0]->title
                }`,
                { slug }
            );
            if (article) {
                juggernauts.push(article);
            }
        }
    }

    // Identify which articles need to be moved
    function needsMove(article) {
        const hasCXO = article.categories?.some(cat => cat.title === 'CXO Interview');
        return !hasCXO;
    }

    const csaNeedMove = csaArticles.filter(needsMove);
    const spotlightNeedMove = spotlightArticles.filter(needsMove);
    const juggerNeedMove = juggernauts.filter(needsMove);

    console.log('='.repeat(100));
    console.log('\n📊 ANALYSIS\n');
    console.log(`CSA Articles:`);
    console.log(`   Already in CXO Interview: ${csaArticles.length - csaNeedMove.length}`);
    console.log(`   Need to move: ${csaNeedMove.length}\n`);

    console.log(`Spotlight Articles:`);
    console.log(`   Already in CXO Interview: ${spotlightArticles.length - spotlightNeedMove.length}`);
    console.log(`   Need to move: ${spotlightNeedMove.length}\n`);

    console.log(`Industry Juggernauts:`);
    console.log(`   Already in CXO Interview: ${juggernauts.length - juggerNeedMove.length}`);
    console.log(`   Need to move: ${juggerNeedMove.length}\n`);

    console.log('='.repeat(100));
    console.log('\n📝 ARTICLES TO UPDATE:\n');

    const allToMove = [...csaNeedMove, ...spotlightNeedMove, ...juggerNeedMove];

    if (allToMove.length === 0) {
        console.log('✅ All articles already in CXO Interview category!\n');
        return;
    }

    allToMove.forEach((article, i) => {
        const type = article._type === 'csa' ? '💰 CSA' : '📄 POST';
        console.log(`${i + 1}. ${type} ${article.title}`);
        console.log(`   Current Category: ${article.primaryCategory || 'None'}`);
        console.log(`   Action: Add "CXO Interview" category\n`);
    });

    console.log('='.repeat(100));
    console.log(`\n📋 SUMMARY: ${allToMove.length} articles need category update\n`);

    // Save IDs for update script
    const fs = await import('fs');
    fs.writeFileSync(
        path.join(process.cwd(), 'scripts', 'articles-to-move.json'),
        JSON.stringify({
            cxoCategoryId: cxoCategory._id,
            articles: allToMove.map(a => ({
                _id: a._id,
                title: a.title,
                currentCategory: a.primaryCategory
            }))
        }, null, 2)
    );

    console.log('✅ Article IDs saved to scripts/articles-to-move.json\n');
}

identifyArticlesToMove();
