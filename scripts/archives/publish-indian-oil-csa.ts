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

async function publishIndianOilArticle() {
    console.log('📝 Publishing Indian Oil CSA Article\n');

    try {
        // Find the draft Indian Oil article
        const draftId = 'drafts.l1PaX4hS53uLi0tV4V3Bog';
        const publishedId = 'l1PaX4hS53uLi0tV4V3Bog';

        console.log(`Looking for draft article: ${draftId}`);

        const draft = await client.getDocument(draftId);

        if (!draft) {
            console.log('❌ Draft article not found!');
            return;
        }

        console.log(`✅ Found draft: "${draft.title}"\n`);

        // Check if published version already exists
        const existing = await client.getDocument(publishedId).catch(() => null);

        if (existing) {
            console.log('⚠️  Published version already exists. Updating it...\n');
        }

        // Remove draft-specific fields
        const { _id, _rev, ...publishData } = draft as any;

        // Publish the article
        console.log('📤 Publishing article...');

        await client.createOrReplace({
            ...publishData,
            _id: publishedId,
            _type: 'csa',
        });

        console.log('✅ Article published successfully!\n');

        // Delete the draft
        console.log('🗑️  Removing draft version...');
        await client.delete(draftId);
        console.log('✅ Draft removed\n');

        // Fetch the published article to verify
        const published = await client.getDocument(publishedId);

        console.log('📊 Published Article Details:');
        console.log(`   Title: ${(published as any).title}`);
        console.log(`   Slug: ${(published as any).slug?.current}`);
        console.log(`   URL: https://csuitemagazine.global/csa/${(published as any).slug?.current}`);
        console.log('\n🎉 Indian Oil CSA article is now live!');

    } catch (error) {
        console.error('❌ Error publishing article:', error);
        process.exit(1);
    }
}

publishIndianOilArticle();
