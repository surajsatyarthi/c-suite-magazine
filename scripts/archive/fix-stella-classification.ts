import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: 'production',
    apiVersion: '2024-10-28',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

async function fixStellaClassification() {
    console.log('🔍 Starting Stella Ambrose Classification Correction...');

    try {
        // 1. Find Stella Ambrose writer document
        const stellaWriter = await client.fetch('*[_type == "writer" && (name match "Stella Ambrose" || slug.current == "stella-ambrose")][0]');

        if (!stellaWriter) {
            console.error('❌ Could not find Stella Ambrose writer document.');
            return;
        }

        console.log(`✅ Found document: ${stellaWriter._id}`);

        // 2. Update writerType and ensure standardized slug
        console.log('✍️ Updating Role to "guest" and Standardizing Slug...');
        await client
            .patch(stellaWriter._id)
            .set({
                writerType: 'guest',
                slug: { _type: 'slug', current: 'stella-ambrose' }
            })
            .commit();

        console.log('🎉 Classification updated successfully!');

    } catch (error) {
        console.error('❌ Error updating Stella Ambrose:', error);
    }
}

fixStellaClassification();
