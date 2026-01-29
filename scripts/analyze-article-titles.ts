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

async function analyzeArticleTitles() {
    console.log('📝 Analyzing Article Titles for Branding\n');
    console.log('='.repeat(100));

    // Get spotlight articles
    const spotlightConfig = await client.fetch(`*[_id == "spotlightConfig"][0] {
        items[]-> {
            _id,
            _type,
            title,
            slug
        }
    }`);

    // Get all CSA articles
    const csaArticles = await client.fetch(`*[_type == "csa"] {
        _id,
        title,
        slug,
        "inSpotlight": _id in *[_id == "spotlightConfig"][0].items[]._ref
    } | order(title asc)`);

    console.log('\n📊 CURRENT TITLES\n');
    console.log('='.repeat(100));

    // CSA Articles
    console.log('\n🔷 CSA ARTICLES (Company Sponsored):\n');
    csaArticles.forEach((article, i) => {
        const spotlightStatus = article.inSpotlight ? '⭐ IN SPOTLIGHT' : '';
        console.log(`${i + 1}. ${article.title} ${spotlightStatus}`);
        console.log(`   Slug: ${article.slug?.current}\n`);
    });

    // Spotlight Articles (non-CSA)
    const spotlightArticles = spotlightConfig.items.filter(item => item._type === 'post');
    console.log('\n🔷 SPOTLIGHT ARTICLES (Regular):\n');
    spotlightArticles.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`);
        console.log(`   Slug: ${article.slug?.current}\n`);
    });

    console.log('='.repeat(100));
    console.log('\n💡 TITLE ANALYSIS\n');

    // Analyze which titles need executive names
    const needsImprovement = [];

    [...csaArticles, ...spotlightArticles].forEach(article => {
        const title = article.title;
        const slug = article.slug?.current || '';

        // Extract name from slug (usually first part)
        const slugParts = slug.split('-');
        const possibleName = slugParts.slice(0, 2).map(s =>
            s.charAt(0).toUpperCase() + s.slice(1)
        ).join(' ');

        // Check if title starts with a name
        const startsWithName = /^[A-Z][a-z]+\s+[A-Z]/.test(title);

        if (!startsWithName) {
            needsImprovement.push({
                _id: article._id,
                _type: article._type,
                currentTitle: title,
                slug: slug,
                suggestedName: possibleName
            });
        }
    });

    console.log(`Articles needing executive name in title: ${needsImprovement.length}\n`);

    needsImprovement.forEach((item, i) => {
        console.log(`${i + 1}. Current: "${item.currentTitle}"`);
        console.log(`   Slug: ${item.slug}`);
        console.log(`   Suggested name: ${item.suggestedName}`);
        console.log(`   Type: ${item._type}\n`);
    });

    // Save data for next script
    const fs = await import('fs');
    fs.writeFileSync(
        path.join(process.cwd(), 'scripts', 'title-analysis.json'),
        JSON.stringify({ csaArticles, spotlightArticles, needsImprovement }, null, 2)
    );

    console.log('='.repeat(100));
    console.log('\n✅ Analysis complete. Data saved to scripts/title-analysis.json\n');
}

analyzeArticleTitles();
