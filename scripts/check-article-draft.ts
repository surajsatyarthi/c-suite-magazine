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

async function checkArticleDraft() {
    const articleTitle = "A Global Mission, Anchored in America: Angelina Usanova's Upcoming Endeavors";

    console.log(`🔍 Checking draft status for: ${articleTitle}\n`);

    // Check for published version
    const published = await client.fetch(`
        *[_type in ["post", "csa"] && title == $title && !(_id in path("drafts.**"))][0] {
            _id,
            _type,
            title,
            _createdAt,
            _updatedAt,
            slug
        }
    `, { title: articleTitle });

    // Check for draft version
    const draft = await client.fetch(`
        *[_type in ["post", "csa"] && title == $title && _id in path("drafts.**")][0] {
            _id,
            _type,
            title,
            _createdAt,
            _updatedAt,
            slug
        }
    `, { title: articleTitle });

    if (published) {
        console.log('📄 Published Version:');
        console.log(`   ID: ${published._id}`);
        console.log(`   Type: ${published._type}`);
        console.log(`   Slug: ${published.slug?.current || 'N/A'}`);
        console.log(`   Created: ${published._createdAt}`);
        console.log(`   Updated: ${published._updatedAt}\n`);
    } else {
        console.log('⚠️  No published version found\n');
    }

    if (draft) {
        console.log('📝 Draft Version:');
        console.log(`   ID: ${draft._id}`);
        console.log(`   Type: ${draft._type}`);
        console.log(`   Slug: ${draft.slug?.current || 'N/A'}`);
        console.log(`   Created: ${draft._createdAt}`);
        console.log(`   Updated: ${draft._updatedAt}\n`);

        console.log('💡 Draft Reason:');
        if (published) {
            const draftUpdated = new Date(draft._updatedAt);
            const publishedUpdated = new Date(published._updatedAt);
            if (draftUpdated > publishedUpdated) {
                console.log('   The draft has unpublished changes made after the published version.');
                console.log(`   Draft updated: ${draft._updatedAt}`);
                console.log(`   Published updated: ${published._updatedAt}`);
            } else {
                console.log('   Draft exists but appears to be in sync with published version.');
            }
        } else {
            console.log('   This is a draft article that has never been published.');
        }
    } else {
        console.log('✅ No draft version found\n');
    }

    if (!published && !draft) {
        console.log('❌ Article not found in Sanity\n');
    }
}

checkArticleDraft().catch(console.error);
