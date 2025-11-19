#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function fetchPostsWithLegacyAuthor() {
  const query = `*[_type == "post" && defined(author._ref)] | order(_createdAt asc) {
    _id,
    title,
    "slug": slug.current
  }`
  return client.fetch(query)
}

async function main() {
  const posts = await fetchPostsWithLegacyAuthor()
  if (!posts.length) {
    console.log('No posts still have legacy author field.')
    return
  }
  console.log(`Unsetting author on ${posts.length} posts...`)
  let updated = 0
  for (const p of posts) {
    try {
      await client.patch(p._id).unset(['author']).commit()
      updated++
      console.log(`✔ Unset author on '${p.title}' (/article/${p.slug})`)
    } catch (err) {
      console.warn(`⚠️ Failed to unset author on ${p._id}: ${err.message}`)
    }
  }
  console.log(`Done. Updated=${updated}, Remaining=${posts.length - updated}`)
}

main().catch((err) => {
  console.error('Unset failed:', err.message)
  process.exit(1)
})

