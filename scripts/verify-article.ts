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

async function verifyArticle() {
    const slug = 'elon-musk-building-future-civilization-scale'
    const article = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    "isDraft": _id in path("drafts.**")
  }`, { slug })

    if (article) {
        console.log('Article found:', JSON.stringify(article, null, 2))
    } else {
        console.log('Article NOT found with slug:', slug)
        // List all posts to see if there's a typo
        const allPosts = await client.fetch(`*[_type == "post"]{title, slug}`)
        console.log('All posts:', JSON.stringify(allPosts, null, 2))
    }
}

verifyArticle()
