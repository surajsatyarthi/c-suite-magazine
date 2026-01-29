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

async function fixDuplicates() {
    // 1. Fetch Current Config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)

    if (!config || !config.items) {
        console.error('Config not found or empty.')
        return
    }

    console.log('Current items count:', config.items.length)

    // 2. Filter out "Industry Leader 1" which is the duplicate image of Elon
    // We want to keep "Elon Musk" and remove the old placeholder that uses the same image
    const newItems = config.items.filter((item: any) => {
        // Keep Elon
        if (item.title === 'Elon Musk') return true

        // Remove the specific placeholder that is causing the duplicate visual
        // "Industry Leader 1" was the original first item
        if (item.title === 'Industry Leader 1.png' || item.title === 'Industry Leader 1') return false

        return true
    })

    console.log('New items count:', newItems.length)

    // 3. Patch Document
    try {
        await client.patch(config._id)
            .set({ items: newItems })
            .commit()
        console.log('Successfully removed duplicate items.')
    } catch (error) {
        console.error('Failed to update config:', error)
    }
}

fixDuplicates()
