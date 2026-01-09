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

async function analyzeDraft() {
    const id = 'Xj1aOvHL2Hs0lhtupB0F2K';

    console.log('🔍 Analyzing Draft Status\n');

    const published = await client.fetch(`*[_id == $id][0]{
        _id,
        _type,
        title,
        _createdAt,
        _updatedAt,
        _rev,
        slug,
        excerpt,
        "bodyLength": length(body)
    }`, { id });

    const draft = await client.fetch(`*[_id == $draftId][0]{
        _id,
        _type,
        title,
        _createdAt,
        _updatedAt,
        _rev,
        slug,
        excerpt,
        "bodyLength": length(body)
    }`, { draftId: `drafts.${id}` });

    console.log('📄 Published Version:');
    console.log(JSON.stringify(published, null, 2));
    console.log('\n📝 Draft Version:');
    console.log(JSON.stringify(draft, null, 2));

    if (published && draft) {
        console.log('\n💡 Comparison:');
        console.log(`   Created at same time: ${published._createdAt === draft._createdAt ? 'Yes' : 'No'}`);
        console.log(`   Same revision: ${published._rev === draft._rev ? 'Yes' : 'No'}`);
        console.log(`   Same slug: ${published.slug?.current === draft.slug?.current ? 'Yes' : 'No'}`);
        console.log(`   Same excerpt: ${published.excerpt === draft.excerpt ? 'Yes' : 'No'}`);
        console.log(`   Same body length: ${published.bodyLength === draft.bodyLength ? 'Yes' : 'No'}`);

        const pubDate = new Date(published._updatedAt);
        const draftDate = new Date(draft._updatedAt);

        if (draftDate > pubDate) {
            const diffMs = draftDate.getTime() - pubDate.getTime();
            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);

            console.log(`\n⚠️  Draft has unpublished changes`);
            console.log(`   Draft is ${diffHours > 0 ? `${diffHours}h ${diffMinutes % 60}m` : `${diffMinutes}m`} newer than published version`);
        } else if (pubDate > draftDate) {
            console.log(`\n⚠️  Published version is newer (unusual!)`);
        } else {
            console.log(`\n✅ Draft and published are in sync`);
        }
    }
}

analyzeDraft().catch(console.error);
