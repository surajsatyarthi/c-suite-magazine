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

async function inspectArticle() {
    const query = `*[_type == "post" && title match "The Asynchronous Enterprise*"] {
    _id,
    title,
    "categories": categories[]->{title, slug, _id},
    "mainImage": mainImage,
    tags
  }`

    const articles = await client.fetch(query)
    console.log(JSON.stringify(articles, null, 2))
}

inspectArticle()
