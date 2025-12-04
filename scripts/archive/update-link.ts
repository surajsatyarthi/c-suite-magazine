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

async function updateLink() {
    // 1. Fetch Config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)

    if (!config || !config.items) {
        console.error('Config not found.')
        return
    }

    // 2. Update the Elon Musk item's link
    const newItems = config.items.map((item: any) => {
        if (item.title === 'Elon Musk') {
            return {
                ...item,
                link: '/category/innovation/elon-musk-building-future-civilization-scale'
            }
        }
        return item
    })

    // 3. Patch Document
    try {
        await client.patch(config._id)
            .set({ items: newItems })
            .commit()
        console.log('Successfully updated Elon Musk link to use category structure.')
    } catch (error) {
        console.error('Failed to update config:', error)
    }
}

updateLink()
