import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
})

async function verifyRatan() {
    const slug = 'ratan-tata-legacy-ethical-leadership'
    const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    title,
    slug,
    "categories": categories[]->{title, slug}
  }`, { slug })

    console.log(JSON.stringify(article, null, 2))
}

verifyRatan()
