
import { createClient } from '@sanity/client';

const client = createClient({
    projectId: '2f93fcy8',
    dataset: 'production',
    apiVersion: '2023-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

async function findMissingKeys() {
    const posts = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**"))] {
            _id,
            title,
            categories,
            "categoryCount": count(categories)
        }
    `);

    console.log(`Checking ${posts.length} posts...`);
    
    const missing = posts.filter(post => {
        if (post.categoryCount > 0) {
            if (!post.categories) return true;
            const keysPresent = post.categories.filter(c => c && c._key).length;
            return keysPresent < post.categoryCount;
        }
        return false;
    });

    if (missing.length > 0) {
        console.log('Offending posts found:');
        missing.forEach(p => {
            console.log(`- ID: ${p._id} | Title: ${p.title} | Expected: ${p.categoryCount} | Found: ${(p.categories || []).map(c => c?._key || 'MISSING').join(', ')}`);
        });
    } else {
        console.log('No offending posts found in the main set.');
    }
}

findMissingKeys();
