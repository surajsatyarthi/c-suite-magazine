import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function cleanupAds() {
    console.log('🔍 Fetching all advertisements...\n')

    const ads = await client.fetch(`*[_type == "advertisement"] | order(_createdAt asc) {
    _id,
    name,
    placement,
    isActive,
    priority
  }`)

    console.log(`Found ${ads.length} total ads:\n`)
    ads.forEach((ad, i) => {
        console.log(`${i + 1}. ${ad.name}`)
        console.log(`   ID: ${ad._id}`)
        console.log(`   Placement: ${ad.placement}`)
        console.log(`   Priority: ${ad.priority}`)
        console.log(`   Active: ${ad.isActive}\n`)
    })

    // Delete all in-article ads (not used)
    const inArticleAds = ads.filter(ad => ad.placement === 'in-article')
    console.log(`\n❌ Deleting ${inArticleAds.length} in-article ads (not used per spec)...`)

    for (const ad of inArticleAds) {
        await client.delete(ad._id)
        console.log(`   ✓ Deleted: ${ad.name}`)
    }

    // Keep only ONE sidebar ad (highest priority)
    const sidebarAds = ads.filter(ad => ad.placement === 'article-sidebar-large')
    if (sidebarAds.length > 1) {
        // Sort by priority (highest first)
        sidebarAds.sort((a, b) => (b.priority || 0) - (a.priority || 0))
        const toKeep = sidebarAds[0]
        const toDelete = sidebarAds.slice(1)

        console.log(`\n✅ Keeping sidebar ad: ${toKeep.name} (Priority: ${toKeep.priority})`)
        console.log(`❌ Deleting ${toDelete.length} duplicate sidebar ad(s)...`)

        for (const ad of toDelete) {
            await client.delete(ad._id)
            console.log(`   ✓ Deleted: ${ad.name}`)
        }
    }

    // Summary
    console.log('\n✅ Cleanup complete!')
    console.log('\n📊 Final state:')

    const finalAds = await client.fetch(`*[_type == "advertisement"] {
    _id,
    name,
    placement,
    isActive,
    priority
  }`)

    console.log(`Total ads: ${finalAds.length}`)
    finalAds.forEach(ad => {
        console.log(`  • ${ad.name} (${ad.placement})`)
    })
}

cleanupAds().catch(console.error)
