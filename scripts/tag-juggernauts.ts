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

const TAG_TO_ADD = 'Industry Juggernaut'

async function tagJuggernauts() {
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

    for (const item of config.items) {
        const slug = item.link.split('/').pop()

        if (!slug) {
            console.log(`Skipping ${item.title}: No slug found in link ${item.link}`)
            continue
        }

        // Find the article
        const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })

        if (!article) {
            console.log(`❌ Article not found for slug: ${slug}`)
            continue
        }

        // Check if tag already exists
        const currentTags = article.tags || []
        if (currentTags.includes(TAG_TO_ADD)) {
            console.log(`ℹ️  ${item.title} already has the tag.`)
            continue
        }

        // Add tag
        try {
            await client.patch(article._id)
                .setIfMissing({ tags: [] })
                .append('tags', [TAG_TO_ADD])
                .commit()
            console.log(`✅ Added tag to ${item.title}`)
        } catch (err) {
            console.error(`❌ Error updating ${item.title}:`, err)
        }
    }

    console.log('Done.')
}

tagJuggernauts()
