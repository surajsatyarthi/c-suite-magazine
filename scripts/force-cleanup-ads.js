import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

// Hardcode the values to ensure we're hitting the right project
const client = createClient({
    projectId: '2f93fcy8',
    dataset: 'production',
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function forceCleanup() {
    console.log('🔍 Fetching ALL advertisements from production dataset...\n')

    const ads = await client.fetch(`*[_type == "advertisement"] | order(_createdAt asc) {
    _id,
    _createdAt,
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
        console.log(`   Priority: ${ad.priority || 0}`)
        console.log(`   Active: ${ad.isActive}\n`)
    })

    // Delete ALL in-article ads
    const inArticleAds = ads.filter(ad => ad.placement === 'in-article')
    if (inArticleAds.length > 0) {
        console.log(`\n❌ Deleting ${inArticleAds.length} in-article ad(s)...`)
        for (const ad of inArticleAds) {
            await client.delete(ad._id)
            console.log(`   ✓ Deleted: ${ad.name} (${ad._id})`)
        }
    }

    // Keep ONLY ONE sidebar ad (highest priority)
    const sidebarAds = ads.filter(ad => ad.placement === 'article-sidebar-large')
    if (sidebarAds.length > 1) {
        sidebarAds.sort((a, b) => (b.priority || 0) - (a.priority || 0))
        const toKeep = sidebarAds[0]
        const toDelete = sidebarAds.slice(1)

        console.log(`\n✅ Keeping: ${toKeep.name} (Priority: ${toKeep.priority})`)
        console.log(`❌ Deleting ${toDelete.length} duplicate sidebar ad(s)...`)

        for (const ad of toDelete) {
            await client.delete(ad._id)
            console.log(`   ✓ Deleted: ${ad.name} (${ad._id})`)
        }
    }

    // Final check
    console.log('\n✅ Cleanup complete! Verifying final state...\n')

    const finalAds = await client.fetch(`*[_type == "advertisement"] {
    _id,
    name,
    placement,
    priority
  }`)

    console.log(`📊 Final count: ${finalAds.length} ad(s)`)
    finalAds.forEach(ad => {
        console.log(`  ✓ ${ad.name} (${ad.placement}, Priority: ${ad.priority || 0})`)
    })
}

forceCleanup().catch(console.error)
