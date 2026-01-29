import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testGetPost(slug: string) {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-02-05',
    useCdn: false,
  })

  console.log(`Testing getPost for slug: ${slug}`)
  console.log(`ProjectID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`)
  console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`)

  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    "categories": categories[]->{title, slug}
  }`

  try {
    const post = await client.fetch(query, { slug })
    if (post) {
      console.log('✅ Post found!')
      console.log(JSON.stringify(post, null, 2))
    } else {
      console.log('❌ Post NOT found.')
    }
  } catch (error) {
    console.error('❌ Error fetching post:', error)
  }
}

const targetSlug = 'ritesh-agarwal-billion-dollar-hostel-kid-rewrote-global-hospitality'
testGetPost(targetSlug)
