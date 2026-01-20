
import { createClient } from '@sanity/client';
import { v4 as uuidv4 } from 'uuid';

const client = createClient({
    projectId: '2f93fcy8',
    dataset: 'production',
    apiVersion: '2023-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
});

async function fixMissingKeys() {
    const posts = await client.fetch(`
        *[_type == "post" && !(_id in path("drafts.**"))] {
            _id,
            title,
            categories,
            "categoryCount": count(categories)
        }
    `);

    console.log(`Checking ${posts.length} posts...`);
    
    for (const post of posts) {
        if (post.categoryCount > 0) {
            let needsFix = false;
            const fixedCategories = post.categories.map(c => {
                if (!c._key) {
                    needsFix = true;
                    return { ...c, _key: uuidv4() };
                }
                return c;
            });

            if (needsFix) {
                console.log(`Fixing keys for: ${post.title} (${post._id})`);
                await client
                    .patch(post._id)
                    .set({ categories: fixedCategories })
                    .commit()
                    .then(() => console.log('✅ Fixed'))
                    .catch(err => console.error(`❌ Failed: ${err.message}`));
            }
        }
    }
    console.log('Done.');
}

fixMissingKeys();
