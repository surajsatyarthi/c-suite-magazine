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

async function checkVersions() {
    const slug = 'rich-stinson-visionary-leader-powering-america-s-electrification-future'
    console.log(`Checking versions for slug: ${slug}`)

    const docs = await client.fetch(`*[_type == "csa" && slug.current == $slug] {
    _id,
    _updatedAt,
    title,
    "bodyCount": count(body)
  }`, { slug })

    console.log('Found documents:', docs)
}

checkVersions()
