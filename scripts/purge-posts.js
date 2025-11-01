#!/usr/bin/env node
// Purge all posts from the Sanity dataset
// Usage: node scripts/purge-posts.js

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function purgeAllPosts() {
  console.log('Fetching posts to delete...')
  const posts = await client.fetch('*[_type == "post"]{ _id, title, slug }')
  console.log(`Found ${posts.length} post(s) to delete`)

  let deleted = 0
  for (const p of posts) {
    try {
      await client.delete(p._id)
      console.log(`🗑️ Deleted: ${p.title || p._id} (${p.slug?.current || 'no-slug'})`)
      deleted++
      await new Promise((r) => setTimeout(r, 75))
    } catch (e) {
      console.error(`Failed to delete ${p._id}:`, e.message)
    }
  }
  console.log(`Done. Deleted ${deleted} post(s).`)
}

purgeAllPosts().catch((e) => {
  console.error('Fatal purge error:', e)
  process.exit(1)
})

