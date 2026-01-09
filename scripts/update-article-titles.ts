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

const titleUpdates = [
    {
        slug: 'shrikant-vaidya-chairman-indianoil',
        oldTitle: 'Leading India\'s Energy Transition: IndianOil Chairman Shrikant Madhav Vaidya on Building a Sustainable Future',
        newTitle: 'Shrikant Madhav Vaidya: Leading India\'s Energy Transition at IndianOil',
        type: 'csa'
    },
    {
        slug: 'erin-krueger',
        oldTitle: 'The Culture Code: How Erin Krueger Turns Teams Into Powerhouses',
        newTitle: 'Erin Krueger: Turning Teams Into Powerhouses Through Culture',
        type: 'post'
    },
    {
        slug: 'bryce-tully',
        oldTitle: 'Forget Traditional Surveys: Bryce Tully\'s Vision for AI-Driven Organizational Insights',
        newTitle: 'Bryce Tully: Revolutionizing Organizational Insights with AI',
        type: 'post'
    }
];

async function updateArticleTitles() {
    console.log('📝 Updating Article Titles for Branding\n');
    console.log('='.repeat(80));

    for (const update of titleUpdates) {
        console.log(`\n${update.type.toUpperCase()}: ${update.slug}`);
        console.log(`OLD: "${update.oldTitle}"`);
        console.log(`NEW: "${update.newTitle}"`);

        try {
            // Find article by slug
            const article = await client.fetch(
                `*[_type == $type && slug.current == $slug][0] { _id, title }`,
                { type: update.type, slug: update.slug }
            );

            if (!article) {
                console.log('   ❌ Article not found!\n');
                continue;
            }

            console.log(`   Found: ${article._id}`);

            // Update title
            await client
                .patch(article._id)
                .set({ title: update.newTitle })
                .commit();

            console.log('   ✅ Updated successfully\n');

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}\n`);
        }
    }

    console.log('='.repeat(80));
    console.log('\n✅ All title updates complete!\n');

    // Verify changes
    console.log('🔍 Verifying changes...\n');

    for (const update of titleUpdates) {
        const article = await client.fetch(
            `*[_type == $type && slug.current == $slug][0] { title }`,
            { type: update.type, slug: update.slug }
        );

        if (article) {
            const matches = article.title === update.newTitle;
            console.log(`${matches ? '✅' : '❌'} ${update.slug}: ${article.title}`);
        }
    }

    console.log('\n');
}

updateArticleTitles();
