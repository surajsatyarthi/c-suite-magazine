
import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { articleImageService } from '../lib/articleImageService';
import { CURATED_IMAGES } from './lib/curated-images';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
    useCdn: false,
});

// The list of articles identified in Phase 3/4 as broken or needing improvement
const RESTORE_TARGETS = [
    "Essential Leadership Qualities That Drive Tech Startup Success",
    "Time Management Strategies for Gen Z Leaders",
    "Breaking the Glass Ceiling: Strategic Pathways for Women",
    "The Decision-Makers Shaping Tomorrow's Business Landscape",
    "Data without Soul: The Fatal Flaw in Modern Executive Presentations",
    "Silent Sabotage: 3 Habits Killing Your Leadership Influence",
    "The Founder-Brand Paradox: When to Step Forward and When to Step Back",
    "Wellness as a Retention Strategy: Why Your Top Talent is Burned Out",
    "Beyond the Resume: The 5 Core Traits of True Entrepreneurship",
    "The Asynchronous Enterprise: Why Meetings are the Enemy of Scale",
    "The Cultural Moat: Why Psychological Safety is the Ultimate Competitive Advantage",
    "The CMO's Dilemma: Why 'Awareness' is a Vanity Metric",
    "Cloud Sovereignty: Why Your Data Strategy is Your Geopolitical Strategy",
    "Zero-Based Budgeting for Growth: Why You Should Fire Your Previous Year's P&L",
    "The 'No-Code' C-Suite: Agility without Engineering Dependencies",
    "Leading Through Crisis: The Case for Trauma-Informed Management",
    "Blueprints for Billions: 5 Entrepreneurial Lessons from Jeff Bezos",
    "Marketing in the Age of Skepticism: Why Trust is the Only Conversion Metric",
    "The Scalable Startup Mindset: How Enterprises Can Innovate Like Day One",
    "The One-Sentence Rule: If You Can't Pitch It in 10 Seconds, You Can't Pitch It"
];

async function restoreImages() {
    console.log("🚀 Starting Permanent Visual Restoration...");
    console.log(`Targeting ${RESTORE_TARGETS.length} articles.\n`);

    for (let i = 0; i < RESTORE_TARGETS.length; i++) {
        const title = RESTORE_TARGETS[i];
        // Use a curated image from the list, cycling through if we run out
        const imageUrl = CURATED_IMAGES[i % CURATED_IMAGES.length];

        console.log(`\n🎯 Restoring: "${title}"`);
        
        // Find the article
        const posts = await client.fetch(`*[_type in ["post", "csa"] && title == $title]`, { title });
        const post = posts[0];

        if (!post) {
            console.error(`  ❌ Article not found in Sanity: ${title}`);
            continue;
        }

        try {
            const filename = `restored-${post._id}-${Date.now()}.png`;
            const assetId = await articleImageService.downloadAndUploadToSanity(imageUrl, client, filename);

            if (assetId) {
                await client.patch(post._id).set({
                    mainImage: {
                        _type: 'image',
                        asset: { _type: 'reference', _ref: assetId },
                        alt: title,
                        caption: 'Permanently restored professional imagery'
                    }
                }).commit();
                console.log(`  ✅ Successfully updated with asset: ${assetId}`);
            } else {
                console.error(`  ❌ Failed to upload asset for: ${title}`);
            }
        } catch (err) {
            console.error(`  ❌ Error during restoration of ${title}:`, err);
        }
        
        // Small delay to avoid hammering APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n🎉 Restoration Phase Complete.");
}

restoreImages().catch(console.error);
