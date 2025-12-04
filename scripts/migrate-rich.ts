import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
const token = process.env.SANITY_API_TOKEN

if (!token) {
    console.error('Error: SANITY_API_TOKEN is missing in .env.local. Cannot write to Sanity.')
    process.exit(1)
}

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
})

async function migrate() {
    console.log('Starting migration for Rich Stinson...')

    // 1. Define the data directly (from public/spotlight.json)
    const richData = {
        title: "Rich Stinson",
        position: "President & CEO, Southwire Company",
        description: "Visionary Leader Powering America’s Electrification Future",
        imageUrl: "https://cdn.sanity.io/images/2f93fcy8/production/74a10dbce48e085b05eb4fe339a70cf8c1790552-800x1200.png",
        link: "/category/cxo-interview/rich-stinson-visionary-leader-powering-america-s-electrification-future"
    }

    // Extract asset ID from URL
    // URL format: https://cdn.sanity.io/images/<projectId>/<dataset>/<assetId>-<dimensions>.<extension>
    // Asset ID format: image-<assetId>-<dimensions>-<extension>
    const urlParts = richData.imageUrl.split('/')
    const filename = urlParts[urlParts.length - 1] // 74a10dbce48e085b05eb4fe339a70cf8c1790552-800x1200.png
    const [id, dimsAndExt] = filename.split('-')
    // This split is tricky because of the dashes.
    // Regex is safer.
    const match = filename.match(/^(.+)-(\d+x\d+)\.(\w+)$/)
    if (!match) {
        console.error('Error: Could not parse image URL.')
        process.exit(1)
    }
    const [, assetHash, dimensions, extension] = match
    const assetId = `image-${assetHash}-${dimensions}-${extension}`

    console.log(`Using Asset ID: ${assetId}`)

    // 2. Construct the new document
    const newDoc = {
        _id: 'executive-rich-stinson', // Deterministic ID
        _type: 'executiveInFocus',
        title: richData.title,
        position: richData.position,
        description: richData.description,
        image: {
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: assetId
            }
        },
        link: `https://csuitemagazine.global${richData.link}`, // Ensure absolute URL
        publishedAt: new Date().toISOString(),
    }

    // 3. Create or replace the document
    try {
        const result = await client.createOrReplace(newDoc)
        console.log('Successfully created/updated Executive in Focus document:')
        console.log(result)
    } catch (err) {
        console.error('Error creating document:', err)
        process.exit(1)
    }
}

migrate()
