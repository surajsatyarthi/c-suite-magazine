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

const JUGGERNAUT_DIR = '/Users/surajsatyarthi/Desktop/Magazine/juggernaught'

const MAPPING = [
    { file: 'elon.png', title: 'Elon Musk', link: '/category/innovation/elon-musk-building-future-civilization-scale' },
    { file: 'tata.png', title: 'Ratan Tata', link: '/category/leadership/ratan-tata-legacy-ethical-leadership' },
    { file: 'bhavesh.png', title: 'Bhavesh Aggarwal', link: '/archive' },
    { file: 'alabbar.png', title: 'Mohamed Alabbar', link: '/archive' },
    { file: 'amin.png', title: 'Amin H. Nasser', link: '/archive' },
    { file: 'chamath.png', title: 'Chamath Palihapitiya', link: '/archive' },
    { file: 'he.png', title: 'He Xiaopeng', link: '/archive' },
    { file: 'murray.png', title: 'Murray Auchincloss', link: '/archive' },
    { file: 'ritesh.png', title: 'Ritesh Agarwal', link: '/archive' },
]

async function updateJuggernautsFinal() {
    console.log('Starting Juggernauts update...')

    const newItems = []

    for (const item of MAPPING) {
        const imagePath = path.join(JUGGERNAUT_DIR, item.file)

        if (!fs.existsSync(imagePath)) {
            console.error(`Image not found: ${imagePath}`)
            continue
        }

        console.log(`Uploading ${item.file}...`)
        const buffer = fs.readFileSync(imagePath)
        const asset = await client.assets.upload('image', buffer, { filename: item.file })

        newItems.push({
            _key: item.file.replace('.png', ''), // Generate a stable key
            title: item.title,
            image: {
                _type: 'image',
                asset: { _type: 'reference', _ref: asset._id }
            },
            link: item.link,
            category: 'Leadership' // Default category
        })
    }

    // Fetch Config
    const config = await client.fetch(`*[_type == "industryJuggernautConfig"][0]`)

    if (config) {
        await client.patch(config._id)
            .set({ items: newItems })
            .commit()
        console.log('Successfully updated Juggernauts config with 9 new items.')
    } else {
        console.error('Config not found.')
    }
}

updateJuggernautsFinal()
