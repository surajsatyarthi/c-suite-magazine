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

async function inspectSpotlightConfig() {
    console.log('🔍 Inspecting Spotlight Configuration\n');

    try {
        // Get the full spotlight config document
        const spotlight = await client.fetch(`*[_id == "spotlightConfig"][0]`);

        console.log('Full spotlight config:');
        console.log(JSON.stringify(spotlight, null, 2));
        console.log('\n');

        // Check what's referencing the old article
        const oldArticleId = 'W97YnOaKPdmcl7N3eWtBwI';
        const references = await client.fetch(`
            *[references($id)] {
                _id,
                _type,
                title
            }
        `, { id: oldArticleId });

        console.log('\nDocuments referencing the old article:');
        console.log(JSON.stringify(references, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectSpotlightConfig();
