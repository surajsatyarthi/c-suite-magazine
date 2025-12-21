import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'
import readline from 'readline'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function cleanupCategories() {
    console.log('--- Cleaning Up Empty Categories ---\n')

    // 1. Audit Phase (Indentify candidates)
    const categories = await client.fetch(`*[_type == "category"]{_id, title, "slug": slug.current}`)
    const categoryMap = new Map()
    categories.forEach((cat: any) => categoryMap.set(cat._id, { ...cat, count: 0 }))

    const posts = await client.fetch(`*[_type == "post"]{ "categories": categories[]{_ref} }`)
    posts.forEach((post: any) => {
        if (post.categories) {
            post.categories.forEach((refObj: any) => {
                if (categoryMap.has(refObj._ref)) {
                    categoryMap.get(refObj._ref).count++
                }
            })
        }
    })

    const emptyCategories = Array.from(categoryMap.values()).filter(cat => cat.count === 0)

    if (emptyCategories.length === 0) {
        console.log('✅ No empty categories found.')
        process.exit(0)
    }

    console.log(`⚠️  Found ${emptyCategories.length} categories with ZERO articles:`)
    emptyCategories.forEach(cat => {
        console.log(`   - "${cat.title}" (ID: ${cat._id})`)
    })

    // 2. Confirmation Phase - Handled by User Approval in Chat
    // For the script runtime, we will just proceed if the user runs this script explicitly.
    // But adding a safety delay/log.

    console.log('\nPREPARING TO DELETE THESE CATEGORIES...')
    console.log('Deleting in 3 seconds (Ctrl+C to cancel)...')

    await new Promise(r => setTimeout(r, 3000))

    for (const cat of emptyCategories) {
        try {
            await client.delete(cat._id)
            console.log(`🗑️  Deleted: "${cat.title}" (${cat._id})`)
        } catch (err: any) {
            console.error(`❌ Failed to delete "${cat.title}": ${err.message}`)
        }
    }

    console.log('\n✅ Cleanup complete.')
    process.exit(0)
}

cleanupCategories()
