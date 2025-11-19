#!/usr/bin/env node
// Fix specific slug artifact like "-the-s-" by updating title and slug.
// Usage:
//   node scripts/fix-slug-artifact.js --old <old-slug> --new-title "Corrected Title"

const { createClient } = require('@sanity/client')
const path = require('path')
try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return undefined
  const val = process.argv[idx + 1]
  return val && !val.startsWith('--') ? val : undefined
}

function generateSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function run() {
  const oldSlug = getArg('old')
  const newTitle = getArg('new-title')
  if (!oldSlug || !newTitle) {
    console.error('Usage: --old <old-slug> --new-title "Corrected Title"')
    process.exit(1)
  }
  const post = await client.fetch('*[_type=="post" && slug.current==$slug][0]{ _id, title, slug, mainImage }', { slug: oldSlug })
  if (!post?._id) {
    console.error(`Post not found for slug '${oldSlug}'`)
    process.exit(1)
  }
  const newSlug = generateSlug(newTitle)
  console.log(`Updating post '${post.title}' -> '${newTitle}', slug '${oldSlug}' -> '${newSlug}'`)
  const patch = client.patch(post._id).set({ title: newTitle, slug: { _type: 'slug', current: newSlug } })
  // Update image alt if present
  if (post.mainImage) {
    patch.set({ mainImage: { ...post.mainImage, alt: newTitle } })
  }
  const res = await patch.commit()
  console.log('✔ Updated post document:', res._id)
  console.log('Done. Consider adding app redirects from old to new slug.')
}

// Ensure global fetch for node
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

run().catch((e) => {
  console.error('Failed to fix slug artifact:', e?.message || e)
  process.exit(1)
})

