const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Using configuration similar to lib/sanity.ts (assuming cdn is false for this test to check ground truth, 
// but we should arguably check with cdn=true to match prod, but let's check basic data integrity first)
const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false, 
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

async function debugFrontendQuery() {
    console.log('--- Simulating Frontend Query ---')
    const query = `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
          cardCount,
          items[]->{ 
            _id, 
            _type,
            title, 
            slug
          }
        }`
    
    try {
        const data = await client.fetch(query)
        console.log('Spotlight Config Query Result:')
        
        if (!data || !data.items) {
            console.log('No data or items found!')
            return
        }

        data.items.forEach((item, idx) => {
            if (item) {
                console.log(`[${idx}] FOUND: ${item.title} (ID: ${item._id})`)
            } else {
                console.log(`[${idx}] NULL (Failed to resolve reference)`)
            }
        })

    } catch (err) {
        console.error('Query failed:', err.message)
    }
}

debugFrontendQuery()
