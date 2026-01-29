import * as dotenv from 'dotenv';
import * as path from 'path';
// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function deleteEmptyCategories() {
    const slugsToDelete = ['events', 'business', 'uncategorized'];
    
    console.log(`🚀 Starting deletion of empty categories: ${slugsToDelete.join(', ')}...\n`);
    console.log('='.repeat(80));

    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
        console.error('❌ Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not defined in .env.local');
        return;
    }

    for (const slug of slugsToDelete) {
        // Double check article count before deletion
        const category = await client.fetch(`*[_type == "category" && slug.current == $slug][0] {
            _id,
            title,
            "articleCount": count(*[_type in ["post", "csa"] && references(^._id)])
        }`, { slug });

        if (!category) {
            console.log(`⚠️ Category with slug "${slug}" not found. Skipping.`);
            continue;
        }

        if (category.articleCount > 0) {
            console.log(`❌ ABORT: Category "${category.title}" has ${category.articleCount} articles! Refusing to delete.`);
            continue;
        }

        try {
            await client.delete(category._id);
            console.log(`✅ Deleted category: ${category.title} (${category._id})`);
        } catch (err: any) {
            console.error(`❌ Failed to delete category "${category.title}":`, err.message);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Deletion Process Complete.');
}

deleteEmptyCategories().catch(console.error);
