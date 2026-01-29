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

interface CSAArticle {
    _id: string;
    title: string;
    slug: { current: string };
    writer?: { name?: string };
}

// Mapping of article IDs to new slug format: {name}-{position}-{company}
const SLUG_UPDATES: Record<string, { newSlug: string; position: string; company: string }> = {
    'fd64f6d9-e720-4c33-826b-7903a806a525': {
        newSlug: 'rich-stinson-ceo-southwire',
        position: 'CEO',
        company: 'Southwire'
    },
    'c79a5d71-febd-4fe1-8dc1-e153c5be57b1': {
        newSlug: 'stella-ambrose-deputy-ceo-sawit-kinabalu',
        position: 'Deputy CEO',
        company: 'Sawit Kinabalu'
    },
    'l1PaX4hS53uLi0tV4V3Bog': {
        newSlug: 'shrikant-vaidya-chairman-indianoil',
        position: 'Chairman',
        company: 'IndianOil'
    },
};

async function updateCSASlugs(dryRun: boolean = false) {
    console.log(`📝 Updating CSA Article Slugs\n`);
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✍️  LIVE UPDATE'}\n`);

    try {
        // Fetch all CSA articles
        const articles: CSAArticle[] = await client.fetch(`
      *[_type == "csa" && !(_id in path("drafts.**"))] {
        _id,
        title,
        slug,
        "writer": writer->{name}
      }
    `);

        console.log(`Found ${articles.length} CSA article(s)\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const article of articles) {
            const update = SLUG_UPDATES[article._id];

            if (!update) {
                console.log(`⏭️  Skipping ${article.title} - no update defined`);
                skippedCount++;
                continue;
            }

            const oldSlug = article.slug.current;
            const newSlug = update.newSlug;

            console.log(`\n📄 ${article.title}`);
            console.log(`   Writer: ${article.writer?.name || 'Unknown'}`);
            console.log(`   Old slug: ${oldSlug}`);
            console.log(`   New slug: ${newSlug}`);
            console.log(`   Position: ${update.position}`);
            console.log(`   Company: ${update.company}`);

            if (dryRun) {
                console.log(`   ✅ Would update (dry run)`);
                updatedCount++;
                continue;
            }

            // Update the document
            try {
                await client
                    .patch(article._id)
                    .set({
                        slug: { _type: 'slug', current: newSlug },
                        legacySlug: oldSlug, // Store old slug for redirects
                    })
                    .commit();

                console.log(`   ✅ Updated successfully`);
                updatedCount++;
            } catch (error) {
                console.error(`   ❌ Error updating:`, error);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`Total articles: ${articles.length}`);
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        if (dryRun) {
            console.log(`\n🔍 Dry run complete. No changes were made.`);
            console.log(`Run without --dry-run to apply changes.\n`);
        } else {
            console.log(`\n🎉 Update complete!\n`);
            console.log(`Next steps:`);
            console.log(`1. Update redirect configuration in next.config.ts`);
            console.log(`2. Test new URLs`);
            console.log(`3. Update sitemap.xml\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Parse arguments
const dryRun = process.argv.includes('--dry-run');

updateCSASlugs(dryRun);
