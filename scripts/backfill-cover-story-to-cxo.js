#!/usr/bin/env node
// Backfill: Add `cxo-interview` category to all posts that have `cover-story`

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY project/dataset env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}
if (!token) {
  console.error('Missing write token. Set SANITY_WRITE_TOKEN or SANITY_API_TOKEN.')
  process.exit(2)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function getCategoryId(slug) {
  const doc = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug })
  return doc?._id || null
}

async function main() {
  const coverId = await getCategoryId('cover-story')
  const cxoId = await getCategoryId('cxo-interview')
  if (!coverId) {
    console.error('Category not found: cover-story')
    process.exit(3)
  }
  if (!cxoId) {
    console.error('Category not found: cxo-interview')
    process.exit(4)
  }

  const posts = await client.fetch(
    '*[_type == "post" && references($coverId)]{ _id, title, categories[]->{ _id, slug } }',
    { coverId }
  )

  let targetPosts = posts
  if (!targetPosts?.length) {
    console.log('No posts found with category: cover-story. Falling back to isFeatured=true posts...')
    targetPosts = await client.fetch(
      '*[_type == "post" && isFeatured == true]{ _id, title, categories[]->{ _id, slug } }'
    )
    if (!targetPosts?.length) {
      console.log('No isFeatured posts found either. Falling back to posts with Executive Interview images...')
      targetPosts = await client.fetch(
        '*[_type == "post" && defined(mainImage.alt) && mainImage.alt match "*Executive Interview*"] | order(publishedAt desc)[0...16]{ _id, title, categories[]->{ _id, slug } }'
      )
      if (!targetPosts?.length) {
        console.log('No suitable posts found. Nothing to update.')
        process.exit(0)
      }
      console.log(`Selected ${targetPosts.length} interview post(s) based on image alt for CXO assignment`)
    }
  }

  let updated = 0
  let skipped = 0

  for (const post of targetPosts) {
    const existing = Array.isArray(post.categories) ? post.categories : []
    const hasCxo = existing.some((c) => (c?.slug?.current || c?.slug) === 'cxo-interview')
    if (hasCxo) { skipped++; continue }

    const newRefs = existing
      .filter((c) => c?._id)
      .map((c) => ({ _type: 'reference', _ref: c._id }))
    newRefs.push({ _type: 'reference', _ref: cxoId })

    try {
      await client.patch(post._id)
        .set({ categories: newRefs })
        .commit()
      updated++
      console.log(`✔ Added cxo-interview: ${post.title}`)
      await new Promise((r) => setTimeout(r, 50))
    } catch (err) {
      console.error(`✖ Failed for ${post.title}:`, err.message)
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (already had cxo-interview): ${skipped}`)
}

main().catch((e) => { console.error('Fatal:', e); process.exit(9) })
