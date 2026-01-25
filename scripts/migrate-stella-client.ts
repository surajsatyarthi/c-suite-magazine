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

async function migrateStellaToClient() {
    console.log('🔍 Migrating Stella Ambrose to "client" type...');

    try {
        const stellaWriter = await client.fetch('*[_type == "writer" && (name match "Stella Ambrose" || slug.current == "stella-ambrose")][0]');

        if (!stellaWriter) {
            console.error('❌ Could not find Stella Ambrose writer document.');
            return;
        }

        console.log(`✅ Found document: ${stellaWriter._id}`);

        await client
            .patch(stellaWriter._id)
            .set({
                writerType: 'client'
            })
            .commit();

        console.log('🎉 Migration successful! Her profile will now return 404.');

    } catch (error) {
        console.error('❌ Error migrating Stella Ambrose:', error);
    }
}

migrateStellaToClient();
