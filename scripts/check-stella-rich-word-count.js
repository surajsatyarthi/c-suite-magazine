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

async function checkWordCounts() {
    console.log('--- Checking Word Counts ---')
    const query = `*[_type == "csa" && (title match "Stella" || title match "Rich")] {
        title,
        wordCount,
        body
    }`
    
    try {
        const docs = await client.fetch(query)
        if (!docs || docs.length === 0) {
            console.log('No documents found.')
            return
        }

        docs.forEach(doc => {
            console.log(`\nTitle: ${doc.title}`)
            console.log(`Stored Word Count: ${doc.wordCount}`)

            // Manual Calculation
            let manualCount = 0
            if (doc.body && Array.isArray(doc.body)) {
                const text = doc.body
                    .map(block => {
                        if (block._type !== 'block' || !block.children) return ''
                        return block.children.map(span => span.text).join(' ')
                    })
                    .join(' ')
                
                manualCount = text.split(/\s+/).filter(w => w.length > 0).length
            }
            console.log(`Calculated Word Count: ${manualCount}`)
        })

    } catch (err) {
        console.error('Error fetching documents:', err.message)
    }
}

checkWordCounts()
