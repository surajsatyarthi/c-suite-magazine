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

async function countLeadershipArticles() {
    console.log('📊 Counting Leadership Category Articles\n');
    console.log('='.repeat(80));

    // Get Leadership category ID
    const leadershipCategory = await client.fetch(`*[_type == "category" && title == "Leadership"][0] { _id, title }`);

    if (!leadershipCategory) {
        console.log('❌ Leadership category not found\n');
        return;
    }

    console.log(`Category: ${leadershipCategory.title} (${leadershipCategory._id})\n`);

    // Count ALL articles (both post and csa) with Leadership category
    const allArticles = await client.fetch(
        `*[_type in ["post", "csa"] && references($categoryId)] {
            _id,
            _type,
            title,
            "categories": categories[]->title
        }`,
        { categoryId: leadershipCategory._id }
    );

    console.log(`Total articles in Leadership category: ${allArticles.length}\n`);
    console.log('='.repeat(80));
    console.log('\nBreakdown by type:\n');

    const posts = allArticles.filter(a => a._type === 'post');
    const csas = allArticles.filter(a => a._type === 'csa');

    console.log(`Regular Articles (post): ${posts.length}`);
    console.log(`CSA Articles (csa): ${csas.length}\n`);

    console.log('='.repeat(80));
    console.log('\n📋 All Leadership Articles:\n');

    allArticles.forEach((article, i) => {
        const type = article._type === 'csa' ? '💰 CSA' : '📄 POST';
        console.log(`${i + 1}. ${type} - ${article.title}`);
    });

    console.log('\n');
}

countLeadershipArticles();
