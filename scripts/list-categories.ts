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

async function listCategories() {
    console.log('--- Listing All Categories ---\n')

    const query = `*[_type == "category"]{
    title,
    "slug": slug.current,
    _id
  } | order(title asc)`

    const categories = await client.fetch(query)

    if (!categories || categories.length === 0) {
        console.log('No categories found.')
    } else {
        console.table(categories)
    }
}

listCategories()
