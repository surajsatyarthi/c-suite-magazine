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

async function fetchContent() {
    const query = `*[_type == "csa" && title match "Sukhinder"][0]{
        title,
        body
    }`
    
    try {
        const doc = await client.fetch(query)
        if (!doc) {
            console.log('Document not found.')
            return
        }

        console.log(`Title: ${doc.title}`)
        
        if (doc.body && Array.isArray(doc.body)) {
            const text = doc.body
                .map(block => {
                    if (block._type !== 'block' || !block.children) return ''
                    // Format headers for readability in output
                    const prefix = block.style && block.style.startsWith('h') ? '\n# ' : ''
                    return prefix + block.children.map(span => span.text).join('')
                })
                .join('\n\n')
            console.log(text)
        }

    } catch (err) {
        console.error('Error fetching document:', err.message)
    }
}

fetchContent()
