const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

async function checkReferences() {
    console.log('--- Checking Spotlight Config References ---')
    // Get the raw refs
    const config = await client.fetch(`*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{ items }`)
    if (!config || !config.items) {
        console.log('No items found')
        return
    }

    console.log(`Found ${config.items.length} items in config. Checking each REF...`)

    for (let i = 0; i < config.items.length; i++) {
        const item = config.items[i]
        const refId = item._ref
        // Check if this ID exists
        const doc = await client.getDocument(refId)
        
        console.log(`[Index ${i}] Ref ID: ${refId}`)
        if (doc) {
            console.log(`   ✅ Exists: "${doc.title}" (_type: ${doc._type})`)
        } else {
            console.log(`   ❌ BROKEN REFERENCE: Document not found!`)
        }
        
        // Specific check for Sukhinder
        if (doc && doc.title && doc.title.includes('Sukhinder')) {
            console.log('   >>> THIS IS SUKHINDER')
        }
    }
}

checkReferences()
