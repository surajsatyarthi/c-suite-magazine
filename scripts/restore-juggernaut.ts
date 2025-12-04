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

async function restoreItem() {
    // 1. Fetch Current Config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)

    if (!config || !config.items) {
        console.error('Config not found.')
        return
    }

    console.log('Current items count:', config.items.length)

    if (config.items.length >= 9) {
        console.log('Already have 9 or more items. No action needed.')
        return
    }

    // 2. Upload "10.png" (Industry Leader 10)
    const filename = '10.png'
    const filePath = path.join(process.cwd(), 'public/juggernauts', filename)

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`)
        return
    }

    console.log(`Uploading ${filename}...`)
    const fileBuffer = fs.readFileSync(filePath)
    const asset = await client.assets.upload('image', fileBuffer, {
        filename: filename
    })

    // 3. Create Item
    const newItem = {
        _key: Math.random().toString(36).substring(7),
        title: 'Industry Leader 10',
        image: {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: asset._id
            }
        },
        link: '/archive',
        category: 'Leadership'
    }

    // 4. Append to Items
    const newItems = [...config.items, newItem]

    // 5. Patch Document
    try {
        await client.patch(config._id)
            .set({ items: newItems })
            .commit()
        console.log('Successfully added Industry Leader 10. Total items:', newItems.length)
    } catch (error) {
        console.error('Failed to update config:', error)
    }
}

restoreItem()
