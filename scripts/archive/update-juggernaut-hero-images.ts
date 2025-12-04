import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

const IMAGES_DIR = '/Users/surajsatyarthi/Desktop/Magazine/juggernaught/juggernaught hero'

async function updateHeroImages() {
    // 1. Get the current order of articles from the config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]{
    items[]{
      title,
      link
    }
  }`)

    if (!config || !config.items) {
        console.error('Config not found')
        return
    }

    console.log('Updating hero images for 9 articles...')

    for (let i = 0; i < config.items.length; i++) {
        const item = config.items[i]
        const index = i + 1
        const imageFilename = `${index}.png`
        const imagePath = path.join(IMAGES_DIR, imageFilename)

        // Extract slug from link (e.g., /category/innovation/slug-name)
        const slug = item.link.split('/').pop()

        if (!slug) {
            console.log(`[${index}] No slug found for ${item.title} (Link: ${item.link})`)
            continue
        }

        if (!fs.existsSync(imagePath)) {
            console.log(`[${index}] Image not found: ${imagePath}`)
            continue
        }

        console.log(`[${index}] Processing ${item.title} (${slug})...`)

        try {
            // Upload image
            const buffer = fs.readFileSync(imagePath)
            const asset = await client.assets.upload('image', buffer, { filename: imageFilename })

            // Find article by slug
            const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })

            if (article) {
                // Update mainImage
                await client.patch(article._id)
                    .set({
                        mainImage: {
                            _type: 'image',
                            asset: { _type: 'reference', _ref: asset._id },
                            alt: item.title // Use title as alt text
                        }
                    })
                    .commit()
                console.log(`[${index}] ✅ Updated mainImage for ${item.title}`)
            } else {
                console.log(`[${index}] ❌ Article not found for slug: ${slug}`)
            }

        } catch (err) {
            console.error(`[${index}] Error updating ${item.title}:`, err)
        }
    }

    console.log('Done.')
}

updateHeroImages()
