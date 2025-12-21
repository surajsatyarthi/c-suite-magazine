
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { CURATED_IMAGES } from './lib/curated-images'
// @ts-ignore
import fetch from 'node-fetch'
import { basename } from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN, // Write access needed
    useCdn: false,
})

// The specific "fireworks" image asset ID that is causing issues
const FIREWORKS_ASSET_ID = "image-0008b5d937815be0dc78258167c484242e86c9c8-1200x800-jpg"

async function downloadImageBuffer(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`)
    return res.buffer()
}

async function uploadUniqueImage(url: string, title: string) {
    console.log(`   ⬇️  Downloading new image: ${url}`)
    const buffer = await downloadImageBuffer(url)

    console.log(`   ⬆️  Uploading to Sanity...`)
    const asset = await client.assets.upload('image', buffer, {
        filename: `unique-stock-${Date.now()}.jpg`
    })

    return asset._id
}

async function fixDuplicates() {
    console.log("🚀 Starting Duplicate Asset Fix...")

    // 1. Fetch all posts with their mainImage asset
    const posts = await client.fetch(`*[_type == "post"] {
    _id,
    title,
    mainImage {
      asset->{_id}
    }
  }`)

    console.log(`📊 Total Posts: ${posts.length}`)

    // 2. Group by Asset ID
    const assetGroups: Record<string, any[]> = {}

    for (const post of posts) {
        const assetId = post.mainImage?.asset?._id
        if (!assetId) continue

        if (!assetGroups[assetId]) assetGroups[assetId] = []
        assetGroups[assetId].push(post)
    }

    // 3. Process each group
    let usedImageIndex = 20 // START AT 20 TO AVOID COLLISIONS WITH PREVIOUS RUN
    let totalFixed = 0

    for (const [assetId, group] of Object.entries(assetGroups)) {
        // If only 1 post uses this asset, and it's NOT the fireworks image, we are good.
        if (group.length === 1 && assetId !== FIREWORKS_ASSET_ID) continue

        console.log(`\n🚨 Found Duplicate Group (Count: ${group.length}) for Asset: ${assetId}`)
        if (assetId === FIREWORKS_ASSET_ID) console.log("   💣 THIS IS THE FIREWORKS IMAGE - REPLACING ALL INSTANCES")

        // Determine which posts to fix
        // If it's fireworks, fix ALL of them.
        // If it's just a normal duplicate, keep the first one and fix the rest.
        const postsToFix = (assetId === FIREWORKS_ASSET_ID) ? group : group.slice(1)

        for (const post of postsToFix) {
            if (usedImageIndex >= CURATED_IMAGES.length) {
                console.warn("⚠️  Ran out of curated images! Looping back to start.")
                usedImageIndex = 0
            }

            const newImageUrl = CURATED_IMAGES[usedImageIndex]
            usedImageIndex++

            try {
                console.log(`🔧 Fixing "${post.title}"...`)

                // Upload new asset
                const newAssetId = await uploadUniqueImage(newImageUrl, post.title)

                // Patch post
                await client.patch(post._id).set({
                    mainImage: {
                        _type: 'image',
                        asset: { _type: 'reference', _ref: newAssetId },
                        alt: `Feature image for ${post.title}`,
                        caption: 'Stock image'
                    }
                }).commit()

                console.log(`   ✅ Fixed! New Asset ID: ${newAssetId}`)
                totalFixed++

                // Rate limit protection
                await new Promise(r => setTimeout(r, 1000))

            } catch (err) {
                console.error(`   ❌ Failed to fix "${post.title}":`, err)
            }
        }
    }

    console.log(`\n🎉 DONE. Total posts fixed: ${totalFixed}`)
}

fixDuplicates().catch(err => {
    console.error("Script failed:", err)
    process.exit(1)
})
