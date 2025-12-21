
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import * as path from 'path'
// @ts-ignore
import fetch from 'node-fetch'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
})

// Fresh images that haven't been used in the loop
const MANUAL_REPLACEMENTS = [
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80", // Guaranteed unique green analytical chart
    "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1200&q=80"
]

const TARGET_TITLES = [
    "Data without Soul: The Fatal Flaw in Modern Executive Presentations",
    "Silent Sabotage: 3 Habits Killing Your Leadership Influence",
    "The Founder-Brand Paradox: When to Step Forward and When to Step Back",
    "Wellness as a Retention Strategy: Why Your Top Talent is Burned Out",
    "Beyond the Resume: The 5 Core Traits of True Entrepreneurship",
    "The Asynchronous Enterprise: Why Meetings are the Enemy of Scale"
]

async function downloadImageBuffer(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}`)
    return res.buffer()
}

async function fixStragglers() {
    console.log("🚀 Starting Targeted Fix for 6 Stragglers...")

    for (let i = 0; i < TARGET_TITLES.length; i++) {
        const title = TARGET_TITLES[i]
        const imageUrl = MANUAL_REPLACEMENTS[i]

        console.log(`\n🎯 Creating unique asset for: "${title}"`)

        const posts = await client.fetch(`*[_type == "post" && title == $title]`, { title })
        const post = posts[0]

        if (!post) {
            console.error(`❌ Could not find post: ${title}`)
            continue
        }

        try {
            const buffer = await downloadImageBuffer(imageUrl)
            const asset = await client.assets.upload('image', buffer, {
                filename: `straggler-fix-${i}.jpg`
            })

            await client.patch(post._id).set({
                mainImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: asset._id },
                    alt: `Unique feature image for ${title}`,
                    caption: 'Stock image'
                }
            }).commit()

            console.log(`   ✅ Fixed with asset: ${asset._id}`)

        } catch (err) {
            console.error("   ❌ Failed:", err)
        }
    }
}

fixStragglers()
