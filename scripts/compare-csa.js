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

async function compareArticles() {
    // Fetch Stella (Working)
    const stella = await client.fetch(`*[_type == "csa" && slug.current match "stella*"][0] {
    title,
    slug,
    "bodyCount": count(body),
    body[0...3]
  }`)

    // Fetch Rich (Broken)
    const rich = await client.fetch(`*[_type == "csa" && slug.current match "rich-stinson*"][0] {
    title,
    slug,
    "bodyCount": count(body),
    body[0...3]
  }`)

    console.log('--- STELLA (Working) ---')
    console.log(JSON.stringify(stella, null, 2))

    console.log('\n--- RICH (Broken) ---')
    console.log(JSON.stringify(rich, null, 2))
}

compareArticles()
