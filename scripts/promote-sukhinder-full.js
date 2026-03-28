const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false, // Force fresh data
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

async function promoteSukhinder() {
    console.log('--- Starting Promotion Workflow ---')

    try {
        // 1. Fetch Sukhinder's Document to get details
        const sukhinderQuery = `*[_type == "csa" && title match "Sukhinder"][0]`
        const sukhinderDoc = await client.fetch(sukhinderQuery)
        
        if (!sukhinderDoc) throw new Error('Sukhinder document not found')
        
        console.log(`Found Sukhinder: ${sukhinderDoc.title}`)

        // 2. Fetch Rich Stinson's Document to get details (for Grid placement)
        const richQuery = `*[_type == "csa" && title match "Rich Stinson"][0]`
        const richDoc = await client.fetch(richQuery)
        
        if (!richDoc) throw new Error('Rich Stinson document not found')
        
        console.log(`Found Rich: ${richDoc.title}`)

        // 3. Update Executive In Focus (The Hero)
        console.log('Updating Executive In Focus...')
        const execId = 'executive-rich-stinson' // The singleton ID is named this, oddly
        // Note: We are overwriting the *content*, effectively replacing Rich with Sukhinder here.
        // We should arguably rename the ID, but that's harder. We'll just update fields.
        
        const newHeroLink = `https://csuitemagazine.global/category/cxo-interview/${sukhinderDoc.slug.current}` // RALPH-BYPASS [script-only, pre-dates lib/urls.ts; not worth importing Node-incompatible Next.js lib here]
        
        // We need her 'hero' image. If she has a specific spotlight image, maybe use that?
        // Let's use her main image for now, ensuring it's the high res one.
        const heroImage = sukhinderDoc.spotlightImage || sukhinderDoc.mainImage
        
        await client.patch(execId).set({
            title: "Sukhinder Singh Cassidy",
            description: "Rewiring the Global Small Business Economy with AI",
            link: newHeroLink,
            image: heroImage,
            position: "CEO, Xero" 
        }).commit()
        
        console.log('✅ Executive In Focus Updated to Sukhinder.')

        // 4. Update Spotlight Config (The Grid)
        console.log('Updating Spotlight Config...')
        const config = await client.fetch(`*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]`)
        
        let items = config.items || []
        
        // Remove Sukhinder from current list (to avoid duplicates)
        items = items.filter(item => item._ref !== sukhinderDoc._id)
        
        // Remove Rich from current list (so we can re-insert him at top)
        items = items.filter(item => item._ref !== richDoc._id)
        
        // Create new item for Rich
        const richItem = {
            _key: `${richDoc._id}-spotlight`, // generate a key
            _type: 'reference',
            _ref: richDoc._id
        }
        
        // Insert Rich at Index 0
        items.unshift(richItem)
        
        // Ensure Stella is at Index 1 (if she isn't already)
        // We find Stella and move her
        const stellaQuery = `*[_type == "csa" && title match "Stella"][0]`
        const stellaDoc = await client.fetch(stellaQuery)
        
        if (stellaDoc) {
             // Remove Stella from wherever she is
             items = items.filter(item => item._ref !== stellaDoc._id)
             // Create ref
             const stellaItem = {
                 _key: `${stellaDoc._id}-spotlight`,
                 _type: 'reference',
                 _ref: stellaDoc._id
             }
             // Insert at Index 1
             items.splice(1, 0, stellaItem)
             console.log('Ensured Stella is at Index 1.')
        }

        // Final dedup pass before committing — guard against any pre-existing duplicates
        const seenRefs = new Set();
        items = items.filter(item => {
            if (seenRefs.has(item._ref)) return false;
            seenRefs.add(item._ref);
            return true;
        });

        // Commit Spotlight Changes
        await client.patch(config._id).set({ items }).commit()
        console.log('✅ Spotlight Grid Updated.')
        console.log('Order should be: 1. Rich, 2. Stella, ...')

    } catch (err) {
        console.error('❌ Error:', err.message)
    }
}

promoteSukhinder()
