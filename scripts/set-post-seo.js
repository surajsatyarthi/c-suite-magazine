#!/usr/bin/env node
// Set SEO metaTitle/metaDescription for a single post by slug
// Usage: node scripts/set-post-seo.js <slug> "Meta Title" "Meta Description(optional)"

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
  const metaTitle = process.argv[3]
  const metaDescription = process.argv[4] || undefined
  if (!slug || !metaTitle) {
    console.error('Usage: node scripts/set-post-seo.js <slug> "Meta Title" "Meta Description(optional)"')
    process.exit(2)
  }

  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, seo }', { slug })
  if (!post?._id) {
    console.error('Post not found for slug:', slug)
    process.exit(3)
  }

  const seo = {
    ...(post.seo || {}),
    metaTitle,
    ...(metaDescription ? { metaDescription } : {}),
  }

  await client.patch(post._id).set({ seo }).commit()
  console.log(`✔ Set SEO for ${slug}: metaTitle="${metaTitle}"${metaDescription ? `, metaDescription set` : ''}`)
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('Failed to set SEO:', e.message); process.exit(1) })

