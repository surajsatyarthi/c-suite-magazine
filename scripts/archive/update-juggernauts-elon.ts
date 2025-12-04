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

async function updateJuggernauts() {
    // 1. Fetch Elon Musk Article
    const elonArticle = await client.fetch(`*[_type == "post" && slug.current == "elon-musk-building-future-civilization-scale"][0]{
    title,
    slug,
    mainImage
  }`)

    if (!elonArticle) {
        console.error('Elon Musk article not found. Please run the creation script first.')
        return
    }

    // 2. Fetch Current Config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)

    if (!config) {
        console.error('Industry Juggernaut config not found.')
        return
    }

    // 3. Prepare Elon Item
    const elonItem = {
        _key: Math.random().toString(36).substring(7),
        title: 'Elon Musk', // Or use elonArticle.title
        image: elonArticle.mainImage, // Use the same image as the article
        link: `/post/${elonArticle.slug.current}`,
        category: 'Leadership'
    }

    // 4. Update Items (Prepend Elon, keep max 9)
    const currentItems = config.items || []
    // Remove any existing Elon item to avoid duplicates if run multiple times
    const filteredItems = currentItems.filter((item: any) => !item.link?.includes('elon-musk'))

    const newItems = [elonItem, ...filteredItems].slice(0, 9)

    // 5. Patch Document
    try {
        await client.patch(config._id)
            .set({ items: newItems })
            .commit()
        console.log('Successfully updated Industry Juggernauts with Elon Musk at #1')
    } catch (error) {
        console.error('Failed to update config:', error)
    }
}

updateJuggernauts()
