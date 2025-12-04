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

async function swapItems() {
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)

    if (!config || !config.items) {
        console.error('Config not found')
        return
    }

    const items = [...config.items]

    // Index 3 is Card #4 (currently Alabbar)
    // Index 7 is Card #8 (currently Murray)

    const indexA = 3
    const indexB = 7

    console.log(`Swapping #${indexA + 1} (${items[indexA].title}) with #${indexB + 1} (${items[indexB].title})`)

    const temp = items[indexA]
    items[indexA] = items[indexB]
    items[indexB] = temp

    await client.patch(config._id)
        .set({ items })
        .commit()

    console.log('Swap complete.')
}

swapItems()
