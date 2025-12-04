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

async function updateRatanImage() {
    const imagePath = path.join(process.cwd(), 'public/juggernauts/ratan-tata-generated.png')

    if (!fs.existsSync(imagePath)) {
        console.error('Image not found at', imagePath)
        return
    }

    console.log('Uploading new image...')
    const buffer = fs.readFileSync(imagePath)
    const asset = await client.assets.upload('image', buffer, { filename: 'ratan-tata-real.jpg' })
    console.log('Image uploaded:', asset._id)

    // 1. Update Article
    const slug = 'ratan-tata-legacy-ethical-leadership'
    const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]`, { slug })

    if (article) {
        await client.patch(article._id)
            .set({
                mainImage: {
                    _type: 'image',
                    asset: { _type: 'reference', _ref: asset._id }
                }
            })
            .commit()
        console.log('Updated article mainImage.')
    } else {
        console.error('Article not found.')
    }

    // 2. Update Juggernauts Config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)
    if (config) {
        const newItems = config.items.map((item: any) => {
            if (item.title === 'Ratan Tata') {
                return {
                    ...item,
                    image: asset.url // Store the URL directly as per schema usage? Or asset ref?
                    // Wait, the schema uses 'image' type which stores asset ref, but the frontend expects URL?
                    // In migrate-juggernauts.ts, we uploaded images and stored them as images.
                    // In IndustryJuggernauts.tsx, we fetch `image.asset->url`.
                    // So in the config document, `image` is an object with `asset`.
                    // But wait, my previous update script `update-juggernauts-ratan.ts` did:
                    // image: ratanArticle.mainImage
                    // which is { _type: 'image', asset: { _ref: ... } }
                    // So that was correct.
                    // Here I should do the same.
                }
            }
            return item
        })

        // Actually, I need to construct the image object correctly for the array item
        const ratanItemIndex = newItems.findIndex((i: any) => i.title === 'Ratan Tata')
        if (ratanItemIndex !== -1) {
            newItems[ratanItemIndex].image = {
                _type: 'image',
                asset: { _type: 'reference', _ref: asset._id }
            }
        }

        await client.patch(config._id)
            .set({ items: newItems })
            .commit()
        console.log('Updated Juggernauts config.')
    }
}

updateRatanImage()
