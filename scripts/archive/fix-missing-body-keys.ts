import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';
import { nanoid } from 'nanoid';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function fixMissingBodyKeys(dryRun: boolean = false) {
    console.log('🔧 Fixing Missing _key Properties in Article Body Blocks\n');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✍️  LIVE UPDATE'}\n`);

    try {
        // Query all normal articles
        const posts = await client.fetch(`
            *[_type == "post" && !(_id in path("drafts.**"))] {
                _id,
                title,
                body
            }
        `);

        console.log(`Found ${posts.length} articles to check\n`);

        let articlesUpdated = 0;
        let totalKeysFixed = 0;

        for (const post of posts) {
            if (!post.body || post.body.length === 0) {
                continue;
            }

            let needsUpdate = false;
            const updatedBody = post.body.map((block: any) => {
                if (!block._key) {
                    needsUpdate = true;
                    return {
                        ...block,
                        _key: nanoid()
                    };
                }
                return block;
            });

            if (needsUpdate) {
                const keysAdded = updatedBody.filter((b: any, i: number) => !post.body[i]._key).length;
                console.log(`📄 ${post.title}`);
                console.log(`   Adding ${keysAdded} missing keys (${updatedBody.length} total blocks)`);

                if (!dryRun) {
                    try {
                        await client
                            .patch(post._id)
                            .set({ body: updatedBody })
                            .commit();
                        console.log(`   ✅ Updated successfully\n`);
                    } catch (error) {
                        console.error(`   ❌ Error updating:`, error);
                        continue;
                    }
                } else {
                    console.log(`   ✅ Would update (dry run)\n`);
                }

                articlesUpdated++;
                totalKeysFixed += keysAdded;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`Total articles checked: ${posts.length}`);
        console.log(`Articles updated: ${articlesUpdated}`);
        console.log(`Total keys fixed: ${totalKeysFixed}`);

        if (dryRun) {
            console.log(`\n🔍 Dry run complete. No changes were made.`);
            console.log(`Run without --dry-run to apply changes.\n`);
        } else {
            console.log(`\n🎉 Update complete!\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Parse arguments
const dryRun = process.argv.includes('--dry-run');

fixMissingBodyKeys(dryRun);
