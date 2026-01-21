import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

if (!projectId || !token) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-10-01',
    useCdn: false,
    token,
});

async function audit() {
    console.log('🔍 Auditing Articles for Missing Images...\n');
    
    // Check for articles where mainImage.asset is NOT defined
    const query = `*[_type in ["post", "csa"] && !(_id in path("drafts.**")) && !defined(mainImage.asset)] {
        _id,
        title,
        _type,
        mainImage
    }`;
    
    const results = await client.fetch(query);
    console.log(`Found ${results.length} articles missing image assets.`);
    
    if (results.length > 0) {
        results.slice(0, 10).forEach((r: any) => {
            console.log(`- [${r._type}] ${r.title} (${r._id})`);
            if (r.mainImage) console.log(`  (Note: mainImage object exists but asset is missing)`);
        });
    }
}

audit();
