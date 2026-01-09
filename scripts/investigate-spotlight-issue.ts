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

async function investigateSpotlightIssue() {
    console.log('🔍 INVESTIGATING SPOTLIGHT CONFIGURATION ISSUE\n');
    console.log('═'.repeat(100) + '\n');

    try {
        // 1. Get raw spotlight config
        console.log('1️⃣  RAW SPOTLIGHT CONFIG DATA:\n');
        const rawSpotlight = await client.fetch(`*[_type == "spotlightConfig"][0]{
            _id,
            title,
            items
        }`);

        console.log(`Spotlight ID: ${rawSpotlight._id}`);
        console.log(`Title: ${rawSpotlight.title}`);
        console.log(`Raw items array length: ${rawSpotlight.items?.length || 0}\n`);

        console.log('Raw items array:');
        rawSpotlight.items?.forEach((item: any, i: number) => {
            console.log(`  ${i + 1}. _ref: ${item._ref}, _key: ${item._key}`);
        });

        // 2. Try to dereference items
        console.log('\n\n2️⃣  DEREFERENCED SPOTLIGHT ITEMS:\n');
        const dereferencedSpotlight = await client.fetch(`*[_type == "spotlightConfig"][0]{
            _id,
            items[]->{
                _id,
                _type,
                title,
                "exists": defined(_id)
            }
        }`);

        console.log(`Total dereferenced: ${dereferencedSpotlight.items?.length || 0}\n`);
        dereferencedSpotlight.items?.forEach((item: any, i: number) => {
            if (!item) {
                console.log(`  ${i + 1}. ❌ NULL/DELETED REFERENCE`);
            } else {
                console.log(`  ${i + 1}. ${item.exists ? '✅' : '❌'} ${item.title || 'NO TITLE'} (${item._type}, ${item._id})`);
            }
        });

        // 3. Check for deleted Angelina articles
        console.log('\n\n3️⃣  CHECKING DELETED ANGELINA ARTICLE:\n');
        const deletedArticleId = 'Xj1aOvHL2Hs0lhtupB0F2K';

        const deletedCheck = await client.fetch(`*[_id == $id][0]{_id, title}`, { id: deletedArticleId });
        console.log(`Deleted article exists in DB: ${deletedCheck ? 'YES ⚠️' : 'NO ✅'}`);
        if (deletedCheck) {
            console.log(`  Title: ${deletedCheck.title}`);
        }

        // 4. Check remaining Angelina article
        console.log('\n4️⃣  CHECKING REMAINING ANGELINA ARTICLE:\n');
        const remainingArticleId = 'W97YnOaKPdmcl7N3eWtBwI';

        const remainingCheck = await client.fetch(`*[_id == $id][0]{_id, title}`, { id: remainingArticleId });
        console.log(`Remaining article exists: ${remainingCheck ? 'YES ✅' : 'NO ❌'}`);
        if (remainingCheck) {
            console.log(`  Title: ${remainingCheck.title}`);
        }

        // 5. Check if remaining article is in spotlight
        const inSpotlight = rawSpotlight.items?.some((item: any) => item._ref === remainingArticleId);
        console.log(`  In spotlight: ${inSpotlight ? 'YES ✅' : 'NO ❌'}`);

        // 6. Count null references
        console.log('\n\n5️⃣  NULL REFERENCE ANALYSIS:\n');
        const nullCount = dereferencedSpotlight.items?.filter((item: any) => !item).length || 0;
        console.log(`Null/broken references in spotlight: ${nullCount}`);

        if (nullCount > 0) {
            console.log('⚠️  ISSUE FOUND: Spotlight has broken references to deleted articles');
        }

        console.log('\n' + '═'.repeat(100) + '\n');

    } catch (error) {
        console.error('❌ Error during investigation:', error);
    }
}

investigateSpotlightIssue();
