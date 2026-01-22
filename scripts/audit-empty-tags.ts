import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function auditEmptyTags() {
    console.log('🔍 Auditing Tags for Article Density...\n');
    console.log('='.repeat(80));

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
        console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not defined in .env.local');
        return;
    }

    // Fetch all tags and count articles that have this tag in their tags array
    // Note: Sanity stores tags as an array of strings in our current schema (from Issue #8)
    const articles = await client.fetch(`*[_type in ["post", "csa"]] { tags }`);
    
    // Count occurrences of each tag
    const tagCounts: Record<string, number> = {};
    articles.forEach((a: any) => {
        if (Array.isArray(a.tags)) {
            a.tags.forEach((tag: string) => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });

    // In our system, tags are often strings, not separate documents. 
    // If they ARE documents, we should check that too.
    const tagDocs = await client.fetch(`*[_type == "tag"] { title, "slug": slug.current }`);
    
    console.log(`Found ${tagDocs.length} defined Tag Documents.\n`);

    const emptyTags = [];
    const activeTags = [];

    for (const tag of tagDocs) {
        const count = tagCounts[tag.title] || 0;
        if (count === 0) {
            emptyTags.push(tag);
        } else {
            activeTags.push({ ...tag, count });
        }
    }

    if (emptyTags.length > 0) {
        console.log('🚨 EMPTY TAGS (0 Articles):');
        emptyTags.forEach(t => console.log(`   - ${t.title} (slug: ${t.slug})`));
    } else {
        console.log('✅ No empty tag documents found.');
    }

    console.log('\n📊 ACTIVE TAG DENSITY:');
    activeTags.sort((a, b) => b.count - a.count).forEach(t => {
        console.log(`   - ${t.title.padEnd(25)}: ${t.count} article(s)`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Tag Audit Complete.');
}

auditEmptyTags().catch(console.error);
