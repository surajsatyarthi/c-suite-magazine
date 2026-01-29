
import { createClient } from '@sanity/client'
import { ENV } from './lib/env'

const client = createClient({
    projectId: ENV.PROJECT_ID,
    dataset: ENV.DATASET,
    apiVersion: '2024-01-01',
    token: ENV.TOKEN,
    useCdn: false,
})

async function auditUniqueness() {
    console.log("🔍 Starting Image Uniqueness Audit...")

    const posts = await client.fetch(`*[_type == "post"] {
    _id,
    title,
    mainImage {
      asset->{_id}
    }
  }`)

    const assetMap = new Map<string, string[]>() // AssetID -> [Titles]
    let hasDuplicates = false

    for (const post of posts) {
        const assetId = post.mainImage?.asset?._id
        if (!assetId) continue // Missing images are a separate issue, ignore here

        if (!assetMap.has(assetId)) {
            assetMap.set(assetId, [])
        }
        assetMap.get(assetId)?.push(post.title)
    }

    console.log(`📊 Scanned ${posts.length} posts.`)

    for (const [assetId, titles] of assetMap.entries()) {
        if (titles.length > 1) {
            console.error(`\n❌ DUPLICATE DETECTED! Asset: ${assetId}`)
            console.error(`   Shared by ${titles.length} articles:`)
            titles.forEach(t => console.error(`   - ${t}`))
            hasDuplicates = true
        }
    }

    if (hasDuplicates) {
        console.error("\n💥 Audit FAILED: Duplicate images found.")
        process.exit(1)
    } else {
        console.log("\n✅ Audit PASSED: All images are unique.")
        process.exit(0)
    }
}

auditUniqueness().catch(err => {
    console.error("Audit script failed:", err)
    process.exit(1)
})
