import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function listAllAds() {
    const ads = await client.fetch(`*[_type == "advertisement"] | order(_createdAt desc) {
    _id,
    _createdAt,
    name,
    placement,
    isActive,
    priority,
    image
  }`)

    console.log(`\n📊 Total advertisements in database: ${ads.length}\n`)

    ads.forEach((ad, i) => {
        console.log(`${i + 1}. ${ad.name}`)
        console.log(`   ID: ${ad._id}`)
        console.log(`   Placement: ${ad.placement}`)
        console.log(`   Priority: ${ad.priority}`)
        console.log(`   Active: ${ad.isActive}`)
        console.log(`   Has Image: ${ad.image ? 'Yes' : 'No'}`)
        console.log(`   Created: ${new Date(ad._createdAt).toLocaleString()}\n`)
    })

    // Group by placement
    const byPlacement = {}
    ads.forEach(ad => {
        if (!byPlacement[ad.placement]) {
            byPlacement[ad.placement] = []
        }
        byPlacement[ad.placement].push(ad)
    })

    console.log('📋 Grouped by placement:')
    Object.entries(byPlacement).forEach(([placement, adsList]) => {
        console.log(`\n  ${placement}: ${adsList.length} ad(s)`)
        adsList.forEach(ad => {
            console.log(`    - ${ad.name} (Priority: ${ad.priority})`)
        })
    })
}

listAllAds().catch(console.error)
