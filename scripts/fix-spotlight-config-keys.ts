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

async function fixSpotlightConfigKeys(dryRun: boolean = false) {
    console.log('🔧 Fixing Missing _key Properties in Spotlight Config\n');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✍️  LIVE UPDATE'}\n`);

    try {
        // Query spotlight config
        const spotlight = await client.fetch(`
            *[_type == "spotlightConfig"][0] {
                _id,
                title,
                items
            }
        `);

        if (!spotlight) {
            console.log('⚠️  No spotlight config found\n');
            return;
        }

        console.log(`Found spotlight config: ${spotlight.title}\n`);

        if (!spotlight.items || spotlight.items.length === 0) {
            console.log('⚠️  No items in spotlight config\n');
            return;
        }

        let needsUpdate = false;
        const updatedItems = spotlight.items.map((item: any) => {
            if (!item._key) {
                needsUpdate = true;
                return {
                    ...item,
                    _key: nanoid()
                };
            }
            return item;
        });

        if (needsUpdate) {
            const keysAdded = updatedItems.filter((item: any, i: number) => !spotlight.items[i]._key).length;
            console.log(`📊 Spotlight Config: ${spotlight.title}`);
            console.log(`   Adding ${keysAdded} missing keys (${updatedItems.length} total items)`);

            if (!dryRun) {
                try {
                    await client
                        .patch(spotlight._id)
                        .set({ items: updatedItems })
                        .commit();
                    console.log(`   ✅ Updated successfully\n`);
                } catch (error) {
                    console.error(`   ❌ Error updating:`, error);
                    process.exit(1);
                }
            } else {
                console.log(`   ✅ Would update (dry run)\n`);
            }

            console.log(`\n📊 Summary:`);
            console.log(`Total keys fixed: ${keysAdded}`);

            if (dryRun) {
                console.log(`\n🔍 Dry run complete. No changes were made.`);
                console.log(`Run without --dry-run to apply changes.\n`);
            } else {
                console.log(`\n🎉 Update complete!\n`);
            }
        } else {
            console.log(`✓ All items already have _key properties\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Parse arguments
const dryRun = process.argv.includes('--dry-run');

fixSpotlightConfigKeys(dryRun);
