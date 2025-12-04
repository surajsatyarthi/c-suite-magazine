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
    // 1. Fetch Ratan Tata Article to get image
    const ratanSlug = 'ratan-tata-legacy-ethical-leadership'
    const ratanArticle = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    title,
    slug,
    mainImage
  }`, { slug: ratanSlug })

    if (!ratanArticle) {
        console.error('Ratan Tata article not found.')
        return
    }

    // 2. Fetch Juggernauts Config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)
    if (!config) {
        console.error('Config not found.')
        return
    }

    // 3. Construct new item
    const ratanItem = {
        _key: 'ratan-tata-juggernaut',
        title: 'Ratan Tata',
        image: ratanArticle.mainImage,
        link: `/category/leadership/${ratanSlug}`,
        category: 'Leadership'
    }

    // 4. Update Items Array
    // We want Elon first, then Ratan, then the rest.
    // Current list has Elon at [0].
    let newItems = [...config.items]

    // Ensure Elon is first (sanity check)
    if (newItems[0].title !== 'Elon Musk') {
        console.warn('Warning: Elon Musk is not at index 0. Proceeding anyway but placing Ratan at index 1.')
    }

    // Insert Ratan at index 1, replacing whatever was there (Industry Leader 2)
    // Or should we insert? "next to elon musk" usually means #2.
    // If we just replace #2, we keep the count same.
    // The user previously wanted 9 cards.
    // If I replace #2, I still have 9 cards.

    newItems[1] = ratanItem

    // 5. Patch
    try {
        await client.patch(config._id)
            .set({ items: newItems })
            .commit()
        console.log('Successfully added Ratan Tata at position #2.')
    } catch (error) {
        console.error('Failed to update config:', error)
    }
}

updateJuggernauts()
