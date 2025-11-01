#!/usr/bin/env node
// Purge TEST content from the Sanity dataset without touching real posts
// Deletes posts and authors whose title/name/slug contains "test" (case-insensitive)
// Usage: node scripts/purge-test-content.js

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function purgeTestPosts() {
  console.log('Searching for test posts...')
  // Match both "test" and "Test" to be safe
  const posts = await client.fetch(
    '*[_type == "post" && (title match "*test*" || title match "*Test*" || slug.current match "*test*" || slug.current match "*Test*")] { _id, title, slug }'
  )
  console.log(`Found ${posts.length} test post(s) to delete`)

  let deleted = 0
  for (const p of posts) {
    try {
      await client.delete(p._id)
      console.log(`🗑️ Deleted post: ${p.title} (${p.slug?.current || 'no-slug'})`)
      deleted++
      await new Promise((r) => setTimeout(r, 75))
    } catch (e) {
      console.error(`Failed to delete post ${p._id}:`, e.message)
    }
  }
  console.log(`Done. Deleted ${deleted} test post(s).`)
}

async function purgeTestAuthors() {
  console.log('Searching for test authors...')
  const authors = await client.fetch(
    '*[_type == "author" && (name match "*test*" || name match "*Test*" || slug.current match "*test*" || slug.current match "*Test*")] { _id, name, slug }'
  )
  console.log(`Found ${authors.length} test author(s) to delete`)

  let deleted = 0
  for (const a of authors) {
    try {
      await client.delete(a._id)
      console.log(`🗑️ Deleted author: ${a.name} (${a.slug?.current || 'no-slug'})`)
      deleted++
      await new Promise((r) => setTimeout(r, 75))
    } catch (e) {
      console.error(`Failed to delete author ${a._id}:`, e.message)
    }
  }
  console.log(`Done. Deleted ${deleted} test author(s).`)
}

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN. Aborting.')
    process.exit(1)
  }
  await purgeTestPosts()
  await purgeTestAuthors()
}

main().catch((e) => {
  console.error('Fatal purge error:', e)
  process.exit(1)
})

