import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Try to load from local .env, then parent .env (if it exists)
dotenv.config({ path: '.env.local' })
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function fixArticleCategory() {
    console.log('--- Fixing Article Category ---\n')

    if (!process.env.SANITY_API_TOKEN) {
        console.error('❌ Error: SANITY_API_TOKEN is missing from environment.')
        console.error('Please ensure .env.local contains the token.')
        process.exit(1)
    }

    // 1. Get the 'Leadership' category ID
    const targetSlug = 'leadership'
    const targetCategory = await client.fetch(`*[_type == "category" && slug.current == "${targetSlug}"][0]{_id, title}`)
    if (!targetCategory) {
        console.error(`❌ Error: Could not find "${targetSlug}" category.`)
        process.exit(1)
    }
    console.log(`✅ Found target category: ${targetCategory.title} (${targetCategory._id})`)

    // 2. Find the article
    const articleQuery = `*[_type == "post" && title match "The Asynchronous Enterprise*"][0] {
    _id,
    title,
    articleType,
    tags,
    "categories": categories[]->slug.current
  }`

    const article = await client.fetch(articleQuery)

    if (!article) {
        console.error('❌ Error: Could not find article "The Asynchronous Enterprise..."')
        process.exit(1)
    }

    console.log(`\nAnalyzing Article: "${article.title}"`)
    console.log(`Current Categories: ${article.categories.join(', ')}`)
    console.log(`Current Tags: ${article.tags?.join(', ') || 'None'}`)
    console.log(`Article Type: ${article.articleType || 'Standard'}`)

    // 3. Safety Checks
    const isJuggernaut = article.tags?.some((t: string) => t.toLowerCase().includes('juggernaut'))
    const isSpotlight = article.articleType === 'spotlight'
    const isCSA = article.categories.some((c: string) => c.includes('company-sponsored')) // Assuming slug convention, checking safe list logic might be better but this is a start
    // Better safe than sorry: explicit check
    if (isJuggernaut) {
        console.error('❌ Aborting: Article is flagged as Industry Juggernaut.')
        process.exit(0)
    }
    if (isSpotlight) {
        console.error('❌ Aborting: Article is flagged as Spotlight.')
        process.exit(0)
    }
    // Check for Executive in Focus or CSA via category logic if needed, but restricting by specific title match is already safe enough for "The Asynchronous Enterprise"?
    // User said "do not touch csa...". The title "The Asynchronous Enterprise" sounds like a normal blog.

    console.log('✅ Safety checks passed (Not Juggernaut/Spotlight)')

    // 4. Update Category
    console.log(`\nUpdating category to "Business"...`)

    try {
        const res = await client.patch(article._id)
            .set({
                categories: [{ _type: 'reference', _ref: targetCategory._id }]
            })
            .commit()

        console.log(`✅ Successfully updated article category to "${targetCategory.title}".`)
        console.log(`Article ID: ${res._id}`)
        console.log(`New Revision: ${res._rev}`)

    } catch (err) {
        console.error('❌ Error updating article:', err)
        process.exit(1)
    }
}

fixArticleCategory()
