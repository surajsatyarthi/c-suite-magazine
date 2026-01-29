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

async function listCSAArticles() {
    console.log('🔍 Fetching CSA articles...\n')

    const csaArticles = await client.fetch(`*[_type == "csa"] {
    _id,
    title,
    slug,
    "ads": content[]._type
  }`)

    console.log(`Found ${csaArticles.length} CSA articles:\n`)
    csaArticles.forEach((article, i) => {
        console.log(`${i + 1}. ${article.title}`)
        console.log(`   ID: ${article._id}`)
        console.log(`   Slug: ${article.slug.current}`)
        console.log(`   Content Blocks: ${JSON.stringify(article.ads)}\n`)
    })
}

listCSAArticles().catch(console.error)
