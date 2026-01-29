import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-05'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset || !token) {
    console.error('Missing required environment variables. Please check .env.local')
    process.exit(1)
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
})

const JUGGERNAUTS_DIR = path.join(process.cwd(), 'public/juggernauts')
const IMAGES = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '9.png', '10.png']

async function uploadImage(filename: string) {
    const filePath = path.join(JUGGERNAUTS_DIR, filename)
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`)
        return null
    }

    const fileBuffer = fs.readFileSync(filePath)
    console.log(`Uploading ${filename}...`)

    try {
        const asset = await client.assets.upload('image', fileBuffer, {
            filename: filename
        })
        return asset._id
    } catch (error) {
        console.error(`Failed to upload ${filename}:`, error)
        return null
    }
}

async function migrate() {
    console.log('Starting migration for Industry Juggernauts...')

    const items = []

    for (const filename of IMAGES) {
        const assetId = await uploadImage(filename)
        if (assetId) {
            items.push({
                _key: Math.random().toString(36).substring(7),
                title: `Industry Leader ${filename.replace('.png', '')}`, // Placeholder title
                image: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: assetId
                    }
                },
                link: '/archive', // Default link
                category: 'Leadership'
            })
        }
    }

    if (items.length === 0) {
        console.error('No images uploaded. Aborting.')
        return
    }

    console.log(`Prepared ${items.length} items. Creating config document...`)

    const doc = {
        _id: 'industryJuggernautConfig',
        _type: 'industryJuggernautConfig',
        title: 'Industry Juggernauts',
        items: items
    }

    try {
        const result = await client.createOrReplace(doc)
        console.log('Successfully created Industry Juggernauts config:', result._id)
    } catch (error) {
        console.error('Failed to create config document:', error)
    }
}

migrate()
