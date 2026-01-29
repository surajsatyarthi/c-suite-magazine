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

async function checkCategoryPageDisplay() {
    console.log('📊 Checking What Articles Display on CXO Interview Category Page\n');
    console.log('='.repeat(100));

    // Get CXO Interview category
    const cxoCategory = await client.fetch(`*[_type == "category" && title == "CXO Interview"][0] { _id }`);

    // Get all articles that should be on category page (have CXO Interview category)
    const articlesInCategory = await client.fetch(
        `*[_type in ["post", "csa"] && references($categoryId)] {
            _id,
            _type,
            title,
            slug,
            isHidden
        }`,
        { categoryId: cxoCategory._id }
    );

    // Get CSA articles
    const csaArticles = await client.fetch(`*[_type == "csa"] {
        _id,
        title,
        slug,
        "hasCXO": references($categoryId)
    }`, { categoryId: cxoCategory._id });

    // Get spotlight articles
    const spotlightConfig = await client.fetch(`*[_id == "spotlightConfig"][0] {
        items[]-> {
            _id,
            title,
            slug,
            "hasCXO": references($categoryId)
        }
    }`, { categoryId: cxoCategory._id });
    const spotlightArticles = (spotlightConfig.items || []).filter(i => i !== null);

    console.log('\n🔷 CSA ARTICLES\n');
    console.log(`Total CSA: ${csaArticles.length}\n`);
    csaArticles.forEach((article, i) => {
        const inCategory = article.hasCXO;
        const status = inCategory ? '✅ YES' : '❌ NO';
        console.log(`${i + 1}. ${status} - ${article.title}`);
        if (!inCategory) {
            console.log(`   Action needed: Add to CXO Interview category`);
        }
        console.log('');
    });

    console.log('='.repeat(100));
    console.log('\n🔷 SPOTLIGHT ARTICLES\n');
    console.log(`Total Spotlight: ${spotlightArticles.length}\n`);
    spotlightArticles.forEach((article, i) => {
        const inCategory = article.hasCXO;
        const status = inCategory ? '✅ YES' : '❌ NO';
        console.log(`${i + 1}. ${status} - ${article.title}`);
        if (!inCategory) {
            console.log(`   Action needed: Add to CXO Interview category`);
        }
        console.log('');
    });

    console.log('='.repeat(100));
    console.log('\n📋 SUMMARY\n');

    const csaMissing = csaArticles.filter(a => !a.hasCXO);
    const spotlightMissing = spotlightArticles.filter(a => !a.hasCXO);

    console.log(`CSA Articles:`);
    console.log(`   Total: ${csaArticles.length}`);
    console.log(`   On category page: ${csaArticles.length - csaMissing.length}`);
    console.log(`   Missing: ${csaMissing.length}\n`);

    console.log(`Spotlight Articles:`);
    console.log(`   Total: ${spotlightArticles.length}`);
    console.log(`   On category page: ${spotlightArticles.length - spotlightMissing.length}`);
    console.log(`   Missing: ${spotlightMissing.length}\n`);

    console.log(`Total articles in CXO Interview category: ${articlesInCategory.length}`);
    console.log(`Hidden articles: ${articlesInCategory.filter(a => a.isHidden).length}\n`);
}

checkCategoryPageDisplay();
