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

async function listCXOInterviewArticles() {
    console.log('📋 Listing All CXO Interview Category Articles\n');
    console.log('='.repeat(100));

    try {
        // Get CXO Interview category ID
        const category = await client.fetch(`*[_type == "category" && title == "CXO Interview"][0] { _id, title }`);

        if (!category) {
            console.error('❌ CXO Interview category not found');
            return;
        }

        console.log(`\nCategory: ${category.title} (${category._id})\n`);

        // Get all articles (both post and csa) that have CXO Interview as a category
        const articles = await client.fetch(`
            *[_type in ["post", "csa"] && references($categoryId)] {
                _id,
                _type,
                title,
                slug,
                "categories": categories[]->title,
                publishedAt,
                "inSpotlight": _id in *[_id == "spotlightConfig"][0].items[]._ref
            } | order(publishedAt desc)
        `, { categoryId: category._id });

        console.log(`Total Articles: ${articles.length}\n`);
        console.log('='.repeat(100));

        // Separate by type and spotlight status
        const csaArticles = articles.filter((a: any) => a._type === 'csa');
        const postArticles = articles.filter((a: any) => a._type === 'post');
        const spotlightArticles = articles.filter((a: any) => a.inSpotlight);
        const nonSpotlightArticles = articles.filter((a: any) => !a.inSpotlight);

        console.log('\n📊 BREAKDOWN:\n');
        console.log(`   CSA Articles: ${csaArticles.length}`);
        console.log(`   Regular Posts: ${postArticles.length}`);
        console.log(`   In Spotlight: ${spotlightArticles.length}`);
        console.log(`   Not in Spotlight: ${nonSpotlightArticles.length}\n`);

        console.log('='.repeat(100));
        console.log('\n📝 COMPLETE LIST:\n');

        articles.forEach((article: any, i: number) => {
            const typeLabel = article._type === 'csa' ? '💰 CSA' : '📄 POST';
            const spotlightLabel = article.inSpotlight ? '⭐ SPOTLIGHT' : '';

            console.log(`${i + 1}. ${typeLabel} ${spotlightLabel}`);
            console.log(`   ${article.title}`);
            console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
            console.log(`   URL: /category/cxo-interview/${article.slug?.current}`);
            console.log(`   Categories: ${article.categories?.join(', ') || 'None'}`);
            console.log(`   Published: ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Not set'}\n`);
        });

        console.log('='.repeat(100));

    } catch (error) {
        console.error('Error:', error);
    }
}

listCXOInterviewArticles();
