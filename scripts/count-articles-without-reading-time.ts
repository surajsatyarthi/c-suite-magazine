import { createClient } from '@sanity/client';
import { config } from '../sanity/config';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

async function countArticlesWithoutReadingTime() {
    try {
        console.log('🔍 Querying Sanity for articles without reading time...\n');

        // Query for all published articles
        const allArticles = await client.fetch(`
      *[_type == "post" && !(_id in path("drafts.**"))] {
        _id,
        title,
        slug,
        readTime,
        publishedAt
      }
    `);

        // Filter articles without reading time
        const articlesWithoutReadingTime = allArticles.filter(
            (article: any) => !article.readTime || article.readTime === null || article.readTime === undefined
        );

        const articlesWithReadingTime = allArticles.filter(
            (article: any) => article.readTime && article.readTime !== null && article.readTime !== undefined
        );

        console.log('📊 RESULTS:\n');
        console.log(`Total articles: ${allArticles.length}`);
        console.log(`Articles WITH reading time: ${articlesWithReadingTime.length}`);
        console.log(`Articles WITHOUT reading time: ${articlesWithoutReadingTime.length}`);
        console.log(`Percentage missing: ${((articlesWithoutReadingTime.length / allArticles.length) * 100).toFixed(2)}%\n`);

        if (articlesWithoutReadingTime.length > 0) {
            console.log('📝 Articles missing reading time:\n');
            articlesWithoutReadingTime
                .sort((a: any, b: any) => {
                    const dateA = new Date(a.publishedAt || 0).getTime();
                    const dateB = new Date(b.publishedAt || 0).getTime();
                    return dateB - dateA; // Most recent first
                })
                .forEach((article: any, index: number) => {
                    console.log(`${index + 1}. ${article.title || 'Untitled'}`);
                    console.log(`   Slug: ${article.slug?.current || 'N/A'}`);
                    console.log(`   Published: ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Not published'}`);
                    console.log(`   ID: ${article._id}\n`);
                });
        } else {
            console.log('✅ All articles have reading time assigned!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

countArticlesWithoutReadingTime();
