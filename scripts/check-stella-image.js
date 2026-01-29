import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: 'production', // Force production
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function checkImage() {
    const slugPattern = "stella*"
    console.log(`Checking image for slug matching: ${slugPattern}`)

    const doc = await client.fetch(`*[_type == "csa" && slug.current match $slugPattern][0] {
    title,
    mainImage {
      asset->,
      alt,
      caption,
      hotspot,
      crop
    }
  }`, { slugPattern })

    if (!doc) {
        console.error('❌ Article not found!')
        return
    }

    console.log('--- Document Data ---')
    console.log(JSON.stringify(doc, null, 2))

    if (!doc.mainImage) {
        console.log('❌ mainImage field is completely MISSING or NULL.')
    } else if (!doc.mainImage.asset) {
        console.log('❌ mainImage exists but has NO ASSET (image file) attached.')
    } else {
        console.log('✅ mainImage seems valid. Asset ID:', doc.mainImage.asset._id)
    }
}

checkImage()
