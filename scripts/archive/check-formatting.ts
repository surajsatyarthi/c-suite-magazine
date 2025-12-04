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

async function checkFormatting() {
    // Fetch the most recent post
    const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc)[0...3] {
    title,
    body
  }`)

    console.log(JSON.stringify(posts, null, 2))
}

checkFormatting()
