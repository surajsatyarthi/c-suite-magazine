require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN,
})

async function checkContent() {
    console.log(`Checking content from Project ID: ${projectId}...\n`)

    // Fetch one random post
    const query = `*[_type == "post"][0] {
    title,
    body
  }`

    try {
        const article = await client.fetch(query)
        if (!article) {
            console.log('No articles found.')
            return
        }

        console.log(`Title: ${article.title}`)
        console.log('--- Body Sample ---')

        // Simple block text extraction
        const blocks = article.body || []
        const text = blocks
            .filter(b => b._type === 'block' && b.children)
            .map(b => b.children.map(c => c.text).join(''))
            .join('\n\n')

        console.log(text.substring(0, 500) + '...')

    } catch (err) {
        console.error('Error fetching article:', err.message)
    }
}

checkContent()
