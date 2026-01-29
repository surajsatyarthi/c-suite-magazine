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

async function discardDraft() {
    const draftId = 'drafts.Xj1aOvHL2Hs0lhtupB0F2K';

    console.log('🗑️  Discarding Draft: Angelina Usanova Article\n');

    try {
        // First, verify the draft exists
        const draft = await client.fetch(`*[_id == $id][0]{_id, title}`, { id: draftId });

        if (!draft) {
            console.log('⚠️  Draft not found. It may have already been deleted.\n');
            return;
        }

        console.log(`Found draft: ${draft.title}`);
        console.log(`Draft ID: ${draft._id}\n`);

        // Delete the draft
        await client.delete(draftId);

        console.log('✅ Draft successfully discarded!\n');
        console.log('The published version remains unchanged.');
        console.log('You can verify in Sanity Studio - the draft indicator should be gone.\n');

    } catch (error) {
        console.error('❌ Error discarding draft:', error);
        process.exit(1);
    }
}

discardDraft();
