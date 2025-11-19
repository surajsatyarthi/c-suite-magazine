#!/usr/bin/env node
// Set a post's title by slug
// Usage: node scripts/set-post-title.js <slug> "New Title"

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-01'

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
  const newTitle = process.argv.slice(3).join(' ').trim()
  if (!slug || !newTitle) {
    console.error('Usage: node scripts/set-post-title.js <slug> "New Title"')
    process.exit(2)
  }

  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title }', { slug })
  if (!post?._id) {
    console.error('Post not found for slug:', slug)
    process.exit(3)
  }

  await client.patch(post._id).set({ title: newTitle }).commit()
  console.log(`✔ Updated title for ${slug}: "${newTitle}"`)
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('Failed to update title:', e.message); process.exit(1) })

