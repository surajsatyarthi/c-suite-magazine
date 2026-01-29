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

async function getCategoryBreakdown() {
    console.log('📊 Category Breakdown: CSA, Spotlight, Industry Juggernauts\n');
    console.log('='.repeat(100));

    // 1. Get CSA articles with categories
    const csaArticles = await client.fetch(`*[_type == "csa"] {
        _id,
        title,
        "categories": categories[]->title
    }`);

    // 2. Get spotlight articles with categories
    const spotlightConfig = await client.fetch(`*[_id == "spotlightConfig"][0] {
        items[]-> {
            _id,
            _type,
            title,
            "categories": categories[]->title
        }
    }`);

    // 3. Get industry juggernaut articles with categories (verify they exist)
    const juggernauts = [];
    const juggernautConfig = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`);

    if (juggernautConfig && juggernautConfig.items) {
        for (const item of juggernautConfig.items) {
            const slug = item.link.split('/').pop();
            const article = await client.fetch(
                `*[_type == "post" && slug.current == $slug][0] { 
                    _id, 
                    title, 
                    "categories": categories[]->title 
                }`,
                { slug }
            );
            if (article) {
                juggernauts.push(article);
            }
        }
    }

    // Count categories for each group
    function countCategories(articles) {
        const counts = {};
        articles.forEach(article => {
            if (article.categories) {
                article.categories.forEach(cat => {
                    counts[cat] = (counts[cat] || 0) + 1;
                });
            }
        });
        return counts;
    }

    const csaCategoryCounts = countCategories(csaArticles);
    const spotlightCategoryCounts = countCategories(spotlightConfig.items.filter(item => item !== null));
    const juggernautCategoryCounts = countCategories(juggernauts);

    // Display results
    console.log('\n🔷 CSA ARTICLES\n');
    console.log(`Total: ${csaArticles.length} articles\n`);
    console.log('Categories:');
    Object.entries(csaCategoryCounts).sort(([, a], [, b]) => b - a).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} article${count > 1 ? 's' : ''}`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n🔷 SPOTLIGHT ARTICLES\n');
    const validSpotlight = spotlightConfig.items.filter(item => item !== null);
    console.log(`Total: ${validSpotlight.length} articles\n`);
    console.log('Categories:');
    Object.entries(spotlightCategoryCounts).sort(([, a], [, b]) => b - a).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} article${count > 1 ? 's' : ''}`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n🔷 INDUSTRY JUGGERNAUTS\n');
    console.log(`Total: ${juggernauts.length} articles\n`);
    console.log('Categories:');
    Object.entries(juggernautCategoryCounts).sort(([, a], [, b]) => b - a).forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count} article${count > 1 ? 's' : ''}`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n📋 SUMMARY\n');
    console.log(`CSA Articles: ${csaArticles.length}`);
    console.log(`Spotlight Articles: ${validSpotlight.length}`);
    console.log(`Industry Juggernauts: ${juggernauts.length}`);
    console.log(`\nTotal Featured Articles: ${csaArticles.length + validSpotlight.length + juggernauts.length}\n`);
}

getCategoryBreakdown();
