import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-10-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function cleanupTagMetadata() {
    console.log('🧹 Cleaning up Tag Metadata (Issue #41)...\n');
    console.log('='.repeat(80));

    if (!process.env.SANITY_WRITE_TOKEN) {
        console.error('❌ Error: SANITY_WRITE_TOKEN is not defined in .env.local');
        return;
    }

    // 1. Find and delete ALL "tag" documents (if any exist)
    const tagDocs = await client.fetch(`*[_type == "tag"] { _id, title }`);
    if (tagDocs.length > 0) {
        console.log(`Found ${tagDocs.length} Tag Documents to delete...`);
        for (const doc of tagDocs) {
            try {
                await client.delete(doc._id);
                console.log(` ✅ Deleted Tag Document: ${doc.title}`);
            } catch (err: any) {
                console.error(` ❌ Failed to delete Tag Document ${doc.title}:`, err.message);
            }
        }
    } else {
        console.log('✅ No Tag Documents found.');
    }

    // 2. Scan all articles for empty strings or stopwords in tags array
    const STOPWORDS = ['his', 'her', 'the', 'and', 'for', 'with', 'from']; 
    const articles = await client.fetch(`*[_type in ["post", "csa"] && (count(tags[@ in ["", null]]) > 0 || count(tags[@ in $stopwords]) > 0)] {
        _id,
        title,
        tags
    }`, { stopwords: STOPWORDS });

    if (articles.length > 0) {
        console.log(`\nCleaning up invalid tags on ${articles.length} articles...`);
        for (const article of articles) {
            const cleanTags = (article.tags || []).filter((tag: string) => 
                tag && 
                tag.trim() !== '' && 
                !STOPWORDS.includes(tag.toLowerCase())
            );

            if (cleanTags.length !== (article.tags || []).length) {
                console.log(` Updating: ${article.title}`);
                try {
                    await client
                        .patch(article._id)
                        .set({ tags: cleanTags })
                        .commit();
                } catch (err: any) {
                    console.error(` ❌ Failed to cleanup tags for ${article.title}:`, err.message);
                }
            }
        }
    } else {
        console.log('\n✅ No articles found with invalid tags.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Tag Metadata Cleanup Complete.');
}

cleanupTagMetadata().catch(console.error);
