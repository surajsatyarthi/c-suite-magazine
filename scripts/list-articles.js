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

async function listArticles() {
    console.log(`Fetching articles from Project ID: ${projectId}...\n`)

    // Query for posts, articles, and CSAs
    const query = `*[_type in ["post", "article", "csa"]] | order(_createdAt desc) {
    title,
    "slug": slug.current,
    _type,
    _createdAt
  }`

    try {
        const articles = await client.fetch(query)
        console.log(`✅ Found ${articles.length} articles:\n`)

        // Group by type for better readability
        const byType = articles.reduce((acc, curr) => {
            const type = curr._type
            if (!acc[type]) acc[type] = []
            acc[type].push(curr)
            return acc
        }, {})

        Object.keys(byType).forEach(type => {
            console.log(`--- Type: ${type.toUpperCase()} (${byType[type].length}) ---`)
            byType[type].forEach((article, i) => {
                console.log(`${i + 1}. ${article.title} (/${article.slug})`)
            })
            console.log('') // Empty line between groups
        })

    } catch (err) {
        console.error('Error fetching articles:', err.message)
    }
}

listArticles()
