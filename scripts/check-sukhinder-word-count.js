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

async function checkWordCount() {
    console.log('--- Checking Word Count for Sukhinder ---')
    const query = `*[_type == "csa" && title match "Sukhinder"][0]{
        title,
        wordCount,
        body
    }`
    
    try {
        const doc = await client.fetch(query)
        if (!doc) {
            console.log('Document not found.')
            return
        }

        console.log(`Title: ${doc.title}`)
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
            
            // Basic word count splitting by whitespace
            manualCount = text.split(/\s+/).filter(w => w.length > 0).length
        }
        console.log(`Calculated Word Count: ${manualCount}`)

    } catch (err) {
        console.error('Error fetching document:', err.message)
    }
}

checkWordCount()
