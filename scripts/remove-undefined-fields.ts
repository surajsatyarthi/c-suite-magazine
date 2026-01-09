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

async function removeUndefinedFields() {
    console.log('🔧 Removing Undefined Fields from Angelina Article\n');

    const angelinaId = 'Xj1aOvHL2Hs0lhtupB0F2K';

    try {
        // Check current state
        const article = await client.getDocument(angelinaId);

        console.log('Current fields:');
        console.log(`   heroImage: ${article.heroImage ? 'Present' : 'Not present'}`);
        console.log(`   spotlightImage: ${article.spotlightImage ? 'Present' : 'Not present'}`);
        console.log(`   mainImage: ${article.mainImage ? 'Present' : 'Not present'}\n`);

        if (!article.heroImage && !article.spotlightImage) {
            console.log('✅ No undefined fields to remove\n');
            return;
        }

        console.log('Removing heroImage and spotlightImage fields...\n');

        await client
            .patch(angelinaId)
            .unset(['heroImage', 'spotlightImage'])
            .commit();

        console.log('✅ Removed undefined fields!\n');

        // Verify
        const updated = await client.getDocument(angelinaId);
        console.log('📊 Final state:');
        console.log(`   heroImage: ${updated.heroImage ? '❌ Still present' : '✅ Removed'}`);
        console.log(`   spotlightImage: ${updated.spotlightImage ? '❌ Still present' : '✅ Removed'}`);
        console.log(`   mainImage: ${updated.mainImage ? '✅ Present' : '❌ Missing'}\n`);

        console.log('ℹ️  The article still has mainImage field which is used by spotlight\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

removeUndefinedFields();
