import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function checkCSAAds() {
    console.log('🔍 Fetching CSA articles with ad details...\n')

    const csaArticles = await client.fetch(`*[_type == "csa"] {
    _id,
    title,
    slug,
    popupAd {
      targetUrl,
      image,
      alt
    },
    "bodyBlocks": body[]._type
  }`)

    console.log(`Found ${csaArticles.length} CSA articles:\n`)
    csaArticles.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`)
        console.log(`   ID: ${article._id}`)
        console.log(`   Popup Ad Configured: ${article.popupAd ? 'Yes' : 'No'}`)
        if (article.popupAd) {
            console.log(`     - Target: ${article.popupAd.targetUrl}`)
            console.log(`     - Alt: ${article.popupAd.alt}`)
            console.log(`     - Has Image: ${article.popupAd.image ? 'Yes' : 'No'}`)
        }
        console.log(`   Body Blocks: ${JSON.stringify(article.bodyBlocks)}\n`)
    })
}

checkCSAAds().catch(console.error)
