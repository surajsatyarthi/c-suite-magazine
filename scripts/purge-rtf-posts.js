#!/usr/bin/env node
// Purge posts with RTF-like slugs from the Sanity dataset
// Usage: node scripts/purge-rtf-posts.js

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function purgeRTFPosts() {
  console.log('Searching for posts with RTF-like slugs...')
  const posts = await client.fetch(
    '*[_type == "post" && slug.current match "rtf1ansi*"] { _id, title, slug }'
  )
  console.log(`Found ${posts.length} RTF post(s) to delete`)

  let deleted = 0
  for (const p of posts) {
    try {
      await client.delete(p._id)
      console.log(`🗑️ Deleted post: ${p.title || 'Untitled'} (${p.slug?.current || 'no-slug'})`)
      deleted++
      await new Promise((r) => setTimeout(r, 75))
    } catch (e) {
      console.error(`Failed to delete post ${p._id}:`, e.message)
    }
  }
  console.log(`Done. Deleted ${deleted} RTF post(s).`)
}

purgeRTFPosts().catch((e) => {
  console.error('Fatal purge error:', e)
  process.exit(1)
})
