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

// Revert cardCount back to 16
client.patch('spotlightConfig').set({ cardCount: 16 }).commit()
    .then(() => console.log('✅ Reverted cardCount back to 16'))
    .catch(err => console.error('Error:', err));
