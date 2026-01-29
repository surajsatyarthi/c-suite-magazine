const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN,
})

async function debugCategory() {
    const categorySlug = 'science-technology'

    console.log(`Checking category: ${categorySlug}`)

    // 1. Get the category ID
    const catQuery = `*[_type == "category" && slug.current == "${categorySlug}"][0]{_id, title}`
    const category = await client.fetch(catQuery)

    if (!category) {
        console.log('Category not found')
        return
    }
    console.log('Category:', category)

    // 2. Find all posts referencing this category (including drafts)
    const postsQuery = `*[_type == "post" && references("${category._id}")] {
    _id,
    title,
    "isHidden": isHidden,
    _createdAt
  }`
    const posts = await client.fetch(postsQuery)

    console.log(`\nFound ${posts.length} posts referencing this category:`)
    posts.forEach(p => {
        console.log(`- [${p._id}] ${p.title} (Hidden: ${p.isHidden})`)
    })

    // 3. Run the exact query from the API route
    const apiQuery = `*[_type == "category" && slug.current == "${categorySlug}" && count(*[_type == "post" && isHidden != true && references(^._id)]) > 0]`
    const apiResult = await client.fetch(apiQuery)
    console.log('\nAPI Query Result (should be empty if count is 0):', apiResult.length > 0 ? 'FOUND' : 'NOT FOUND')
}

debugCategory()
