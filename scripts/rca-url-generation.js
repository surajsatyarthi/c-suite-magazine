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

async function simulateUrlGeneration() {
    console.log('--- Simulating lib/spotlight.ts Logic ---')
    
    // exact query from lib/spotlight.ts (Before my recent edit attempt, or approximating it)
    const query = `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
          cardCount,
          items[]->{ 
            _id, 
            _type,
            title, 
            slug, 
            "primaryCategory": categories[0]->{ slug } 
          }
    }`

    try {
        const data = await client.fetch(query)
        const items = data.items || []

        items.forEach((p, idx) => {
            if (!p) return 
            
            // Simulating the logic
            const cat = p.primaryCategory?.slug?.current || 'cxo-interview'
            const postSlug = p.slug?.current
            
            // The logic that was likely failing
            const generatedHref = (postSlug) ? `/category/${cat}/${postSlug}` : '/archive'
            
            console.log(`\n[Item ${idx}] ${p.title}`)
            console.log(`  _type: ${p._type}`)
            console.log(`  slug.current: ${postSlug || 'UNDEFINED'}`)
            console.log(`  primaryCategory: ${cat}`)
            console.log(`  Generated URL: ${generatedHref}`)
            
            if (p.title.includes('Rich Stinson')) {
                console.log('  >>> TARGET CHECK: Does this match 404 URL?')
            }
        })

    } catch (err) {
        console.error('Error:', err.message)
    }
}

simulateUrlGeneration()
