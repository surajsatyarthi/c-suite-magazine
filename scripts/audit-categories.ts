import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false, // Always fresher data for audits
    token: process.env.SANITY_API_TOKEN,
})

async function auditCategories() {
    console.log('--- Auditing Categories ---\n')

    // 1. Fetch all categories
    const categories = await client.fetch(`*[_type == "category"]{_id, title, "slug": slug.current}`)
    const categoryMap = new Map()

    categories.forEach((cat: any) => {
        categoryMap.set(cat._id, { ...cat, count: 0 })
    })

    console.log(`ℹ️  Found ${categories.length} total categories definitions.`)

    // 2. Fetch all posts with their category references
    // We only need the _ref inside the categories array
    const posts = await client.fetch(`*[_type == "post"]{
    _id, 
    title, 
    "categories": categories[]{_ref}
  }`)

    console.log(`ℹ️  Scanning ${posts.length} articles...\n`)

    const danglingRefs: any[] = []

    // 3. Analyze linkages
    posts.forEach((post: any) => {
        if (post.categories && Array.isArray(post.categories)) {
            post.categories.forEach((refObj: any) => {
                const refId = refObj._ref

                if (categoryMap.has(refId)) {
                    // Valid reference: increment count
                    const catData = categoryMap.get(refId)
                    catData.count += 1
                } else {
                    // Invalid/Dangling reference
                    danglingRefs.push({
                        articleTitle: post.title,
                        articleId: post._id,
                        missingCategoryId: refId
                    })
                }
            })
        }
    })

    // 4. Report: Dangling References (Articles pointing to non-existent categories)
    if (danglingRefs.length > 0) {
        console.log('🚩 ISSUE: Articles linking to non-existent categories (Dangling References):')
        danglingRefs.forEach(item => {
            console.log(`   - Article: "${item.articleTitle}" (${item.articleId})`)
            console.log(`     -> Points to missing Category ID: ${item.missingCategoryId}`)
        })
    } else {
        console.log('✅ PASS: No articles found linking to non-existent categories.')
    }

    console.log('\n--------------------------------------------------\n')

    // 5. Report: Empty Categories (Zero articles)
    const emptyCategories = Array.from(categoryMap.values()).filter(cat => cat.count === 0)

    if (emptyCategories.length > 0) {
        console.log(`⚠️  WARNING: ${emptyCategories.length} Categories found with ZERO articles:`)
        emptyCategories.forEach(cat => {
            console.log(`   - "${cat.title}" (Slug: ${cat.slug || 'N/A'}) [ID: ${cat._id}]`)
        })
    } else {
        console.log('✅ PASS: All categories have at least one article.')
    }

    console.log('\n--- Audit Complete ---')
}

auditCategories()
