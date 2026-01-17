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

async function debugRich() {
    console.log('--- Debugging Rich Stinson ---')
    // We search by title match just to be sure we find it
    const query = `*[_type in ["post", "csa"] && title match "Rich Stinson"][0]{
        _id,
        _type,
        title,
        slug,
        "categories": categories[]->{title, slug}
    }`
    
    try {
        const doc = await client.fetch(query)
        if (doc) {
            console.log('Document Found:')
            console.log(JSON.stringify(doc, null, 2))
        } else {
            console.log('Document NOT FOUND.')
        }
    } catch (err) {
        console.error('Error fetching document:', err.message)
    }
}

debugRich()
