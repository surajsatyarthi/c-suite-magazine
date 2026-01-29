import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

const TARGET_TEXT = "Exclusive Leadership Dialogue | CSuite Magazine | December 2025"

async function removeJuggernautText() {
    console.log('Fetching Juggernaut configuration...')

    // 1. Get the list of Juggernaut articles from the config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]{
        items[]{
            title,
            link
        }
    }`)

    if (!config || !config.items) {
        console.error('Config not found or empty.')
        return
    }

    console.log(`Found ${config.items.length} Juggernaut items. Processing...`)

    const results: { title: string; status: string }[] = []

    for (const item of config.items) {
        const slug = item.link.split('/').pop()

        if (!slug) {
            results.push({ title: item.title, status: 'Skipped (No slug)' })
            continue
        }

        // Find the article
        const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })

        if (!article) {
            results.push({ title: item.title, status: 'Skipped (Article not found)' })
            continue
        }

        if (!article.body || !Array.isArray(article.body)) {
            results.push({ title: item.title, status: 'Skipped (No body)' })
            continue
        }

        let hasChanges = false
        const newBody = article.body.filter((block: any) => {
            if (block._type === 'block' && block.children) {
                const text = block.children.map((c: any) => c.text).join('')
                if (text.includes(TARGET_TEXT)) {
                    hasChanges = true
                    return false // Remove this block
                }
            }
            return true // Keep other blocks
        })

        if (hasChanges) {
            try {
                await client.patch(article._id)
                    .set({ body: newBody })
                    .commit()
                results.push({ title: item.title, status: '✅ Removed' })
            } catch (err) {
                console.error(`Error updating ${item.title}:`, err)
                results.push({ title: item.title, status: '❌ Error' })
            }
        } else {
            results.push({ title: item.title, status: 'No Match Found' })
        }
    }

    // Generate Table
    console.log('\n\n### Removal Confirmation Table')
    console.log('| Article Title | Status |')
    console.log('| :--- | :--- |')
    results.forEach(r => {
        console.log(`| ${r.title} | ${r.status} |`)
    })
}

removeJuggernautText()
