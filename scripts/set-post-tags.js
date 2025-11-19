#!/usr/bin/env node
// Set tags for a single post by slug
// Usage: node scripts/set-post-tags.js <slug> "tag1,tag2,tag3"

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
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}
if (!token) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function main() {
  const slug = process.argv[2]
  const tagsInput = process.argv[3] || ''
  if (!slug) {
    console.error('Usage: node scripts/set-post-tags.js <slug> "tag1,tag2,tag3"')
    process.exit(2)
  }
  const tags = tagsInput
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (!tags.length) {
    console.error('Provide at least one tag as a comma-separated string.')
    process.exit(3)
  }

  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title }', { slug })
  if (!post?._id) {
    console.error('Post not found for slug:', slug)
    process.exit(4)
  }

  await client.patch(post._id).set({ tags }).commit()
  console.log(`✔ Set tags for ${slug}: [${tags.join(', ')}]`)
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('Failed to set tags:', e.message); process.exit(1) })

