import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';

console.log('Env Check:');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('DATASET:', process.env.NEXT_PUBLIC_SANITY_DATASET);

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function auditEmptyCategories() {
    console.log('\n🔍 Auditing Categories for Article Density...\n');
    console.log('='.repeat(80));

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
        console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not defined in .env.local');
        return;
    }

    // Fetch all categories and the count of articles referencing them
    const categories = await client.fetch(`*[_type == "category"] {
        _id,
        title,
        "slug": slug.current,
        "articleCount": count(*[_type in ["post", "csa"] && references(^._id)])
    }`);

    console.log('RAW CATEGORIES FETCHED:', categories.length);
    categories.forEach(c => console.log(`- ${c.title} (${c.slug}) [${c.articleCount}]`));

    const emptyCategories = categories.filter(c => c.articleCount === 0);
    console.log(`\nFound ${emptyCategories.length} categories with ZERO articles.`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Audit Complete.');
}

auditEmptyCategories().catch(console.error);
