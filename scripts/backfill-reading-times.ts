import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';
import { calculateReadingTime } from '../lib/calculateReadingTime';

// Verify write token is available
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!token) {
    console.error('❌ Error: SANITY_WRITE_TOKEN or SANITY_API_TOKEN environment variable is required');
    console.error('Please ensure your .env.local file contains a valid Sanity write token.\n');
    process.exit(1);
}

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token,
});

interface Article {
    _id: string;
    title: string;
    slug: { current: string };
    body: any[];
    readTime?: number;
}

interface BackfillOptions {
    dryRun?: boolean;
    limit?: number;
}

async function backfillReadingTimes(options: BackfillOptions = {}) {
    const { dryRun = false, limit } = options;

    console.log('📚 Starting Reading Time Backfill\n');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN (no changes will be made)' : '✍️  LIVE UPDATE'}`);
    if (limit) {
        console.log(`Limit: Processing ${limit} articles only\n`);
    }
    console.log('---\n');

    try {
        // Query for articles without readTime
        let query = `*[_type == "post" && !(_id in path("drafts.**")) && !defined(readTime)] {
      _id,
      title,
      slug,
      body
    }`;

        if (limit) {
            query += `[0...${limit}]`;
        }

        const articles: Article[] = await client.fetch(query);

        if (articles.length === 0) {
            console.log('✅ All articles already have reading time assigned!');
            return;
        }

        console.log(`Found ${articles.length} article(s) without reading time\n`);

        const updates: { id: string; title: string; readTime: number }[] = [];
        const errors: { id: string; title: string; error: string }[] = [];

        // Process each article
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];

            try {
                // Calculate reading time
                const readTime = calculateReadingTime(article.body);

                updates.push({
                    id: article._id,
                    title: article.title || 'Untitled',
                    readTime,
                });

                // Log progress every 10 articles
                if ((i + 1) % 10 === 0) {
                    console.log(`📊 Progress: ${i + 1}/${articles.length} articles processed...`);
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push({
                    id: article._id,
                    title: article.title || 'Untitled',
                    error: errorMessage,
                });
                console.error(`❌ Error processing "${article.title}": ${errorMessage}`);
            }
        }

        console.log('\n---\n');

        // Display summary
        console.log('📋 Summary:');
        console.log(`Total articles processed: ${articles.length}`);
        console.log(`Successful calculations: ${updates.length}`);
        console.log(`Errors: ${errors.length}\n`);

        if (dryRun) {
            console.log('🔍 DRY RUN - Sample of calculated reading times:\n');
            updates.slice(0, 10).forEach((update, index) => {
                console.log(`${index + 1}. "${update.title}"`);
                console.log(`   Reading Time: ${update.readTime} minutes\n`);
            });

            console.log('\n✅ Dry run complete. No changes were made to the database.');
            console.log('To apply these changes, run the script without --dry-run flag.\n');
            return;
        }

        // Apply updates in batches
        if (updates.length > 0) {
            console.log('💾 Applying updates to Sanity...\n');

            const BATCH_SIZE = 10;
            let successCount = 0;

            for (let i = 0; i < updates.length; i += BATCH_SIZE) {
                const batch = updates.slice(i, i + BATCH_SIZE);

                const transaction = client.transaction();

                batch.forEach(update => {
                    transaction.patch(update.id, {
                        set: { readTime: update.readTime }
                    });
                });

                try {
                    await transaction.commit();
                    successCount += batch.length;
                    console.log(`✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Updated ${batch.length} articles (Total: ${successCount}/${updates.length})`);
                } catch (error) {
                    console.error(`❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
                }
            }

            console.log('\n🎉 Backfill complete!');
            console.log(`Successfully updated ${successCount} out of ${updates.length} articles\n`);
        }

        if (errors.length > 0) {
            console.log('⚠️  Errors encountered:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. "${error.title}" (${error.id}): ${error.error}`);
            });
            console.log('');
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : undefined;

// Run the backfill
backfillReadingTimes({ dryRun, limit });
