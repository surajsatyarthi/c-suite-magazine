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

async function compareVersions() {
    const id = 'Xj1aOvHL2Hs0lhtupB0F2K';

    console.log('🔍 Detailed Comparison: Draft vs Published\n');
    console.log('='.repeat(80));

    const published = await client.fetch(`*[_id == $id][0]`, { id });
    const draft = await client.fetch(`*[_id == $draftId][0]`, { draftId: `drafts.${id}` });

    // Field-by-field comparison
    const fields = ['title', 'slug', 'excerpt', 'writer', 'mainImage', 'categories', 'tags',
        'body', 'publishedAt', 'isFeatured', 'readTime', 'views', 'wordCount'];

    let differencesFound = false;

    for (const field of fields) {
        const pubValue = published?.[field];
        const draftValue = draft?.[field];

        if (JSON.stringify(pubValue) !== JSON.stringify(draftValue)) {
            differencesFound = true;
            console.log(`\n📝 Field: ${field}`);
            console.log('─'.repeat(80));
            console.log('Published:');
            console.log(JSON.stringify(pubValue, null, 2));
            console.log('\nDraft:');
            console.log(JSON.stringify(draftValue, null, 2));
        }
    }

    if (!differencesFound) {
        console.log('\n✅ No content differences found between published and draft versions!');
        console.log('\nThe draft likely exists due to:');
        console.log('  • Auto-save when the article was opened in Sanity Studio');
        console.log('  • Metadata updates (e.g., _updatedAt, _rev)');
        console.log('  • No actual editorial changes were made\n');
        console.log('💡 Recommendation: You can safely discard this draft.\n');
    } else {
        console.log('\n⚠️  Differences found! Review the changes above.\n');
    }

    // Check system fields
    console.log('\n📊 System Metadata:');
    console.log('─'.repeat(80));
    console.log(`Published - Updated: ${published._updatedAt}, Revision: ${published._rev}`);
    console.log(`Draft     - Updated: ${draft._updatedAt}, Revision: ${draft._rev}`);

    const pubDate = new Date(published._updatedAt);
    const draftDate = new Date(draft._updatedAt);
    const diffMs = draftDate.getTime() - pubDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    console.log(`\nTime difference: ${diffDays} days`);
}

compareVersions().catch(console.error);
