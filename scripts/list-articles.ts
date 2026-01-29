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

async function listArticles() {
  const articles = await client.fetch(`*[_type == "post" && !("Industry Juggernaut" in tags)] | order(publishedAt desc)[0...5] {
    title,
    slug,
    tags,
    "category": categories[0]->slug.current
  }`)

  console.log(JSON.stringify(articles, null, 2))
}

listArticles()
