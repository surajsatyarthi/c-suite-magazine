import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';
import { config } from '../sanity/config';
import { calculateReadingTime } from '../lib/calculateReadingTime';

const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
});

async function backfillCSAReadingTimes(dryRun: boolean = false) {
    console.log('📚 Backfilling CSA Article Reading Times\n');
    console.log(`Mode: ${dryRun ? '🔍 DRY RUN' : '✍️  LIVE UPDATE'}\n`);

    try {
        // Query for CSA articles
        const articles = await client.fetch(`
      *[_type == "csa" && !(_id in path("drafts.**"))] {
        _id,
        title,
        body,
        readTime
      }
    `);

        console.log(`Found ${articles.length} CSA article(s)\n`);

        for (const article of articles) {
            const calculatedReadTime = calculateReadingTime(article.body);
            const currentReadTime = article.readTime;

            console.log(`📄 ${article.title}`);
            console.log(`   Current: ${currentReadTime || 'NOT SET'} min`);
            console.log(`   Calculated: ${calculatedReadTime} min`);

            if (dryRun) {
                console.log(`   ✅ Would update\n`);
                continue;
            }

            // Update the document
            try {
                await client
                    .patch(article._id)
                    .set({ readTime: calculatedReadTime })
                    .commit();

                console.log(`   ✅ Updated successfully\n`);
            } catch (error) {
                console.error(`   ❌ Error updating:`, error);
            }
        }

        console.log(`\n${dryRun ? '🔍 Dry run complete' : '🎉 Update complete'}!\n`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Parse arguments
const dryRun = process.argv.includes('--dry-run');

backfillCSAReadingTimes(dryRun);
