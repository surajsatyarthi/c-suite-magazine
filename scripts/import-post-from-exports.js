#!/usr/bin/env node
// Import a single post from local exports JSON into Sanity
// Usage: node scripts/import-post-from-exports.js <slug>

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

// Load env from .env.local if present
try {
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY project/dataset env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}
if (!token) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function ensureWriter(name, slugCurrent) {
const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug: slugCurrent })
  if (existing?._id) return { _type: 'reference', _ref: existing._id }

  const doc = {
_type: 'writer',
    name,
    slug: { _type: 'slug', current: slugCurrent },
  }
  const created = await client.create(doc)
  return { _type: 'reference', _ref: created._id }
}

async function getOrCreateCategory(title, slugCurrent) {
  const existing = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug: slugCurrent })
  if (existing?._id) return { _type: 'reference', _ref: existing._id }

  const doc = {
    _type: 'category',
    title,
    slug: { _type: 'slug', current: slugCurrent },
  }
  const created = await client.create(doc)
  return { _type: 'reference', _ref: created._id }
}

async function upsertPostFromExport(json) {
  const slugCurrent = json.slug || json?.slug?.current
  if (!slugCurrent) throw new Error('Export JSON missing slug')

  // Resolve writer (prefer top-level writerSlug)
  const writerName = json?.writer?.name || json?.author?.name || 'Editorial Team'
  const writerSlug = json?.writerSlug || json?.writer?.slug?.current || json?.author?.slug?.current || slugCurrent.replace(/[^a-z0-9-]+/g, '-') + '-writer'
  const writerRef = await ensureWriter(writerName, writerSlug)

  // Resolve categories
  const categories = Array.isArray(json.categories) ? json.categories : []
  const categoryRefs = []
  for (const c of categories) {
    const s = c?.slug?.current || c?.slug || 'general'
    const t = c?.title || s
    const ref = await getOrCreateCategory(t, s)
    if (ref) categoryRefs.push(ref)
  }

  // Prepare mainImage
  let mainImage
  const assetId = json?.mainImage?.asset?._id
  const alt = json?.mainImage?.alt || json?.title || 'Article Image'
  if (assetId) {
    mainImage = { _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt }
  }

  // Find existing post by slug
  const existing = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id }', { slug: slugCurrent })

  const doc = {
    _type: 'post',
    title: json.title,
    slug: { _type: 'slug', current: slugCurrent },
    excerpt: json.excerpt || null,
    writer: writerRef,
    categories: categoryRefs,
    isFeatured: !!json.isFeatured,
    readTime: json.readTime,
    views: json.views,
    wordCount: json.wordCount,
    body: Array.isArray(json.body) ? json.body : [],
    ...(mainImage ? { mainImage } : {}),
    publishedAt: new Date().toISOString(),
  }

  if (existing?._id) {
    const res = await client.patch(existing._id).set(doc).commit()
    return { action: 'updated', id: res._id }
  } else {
    const res = await client.create(doc)
    return { action: 'created', id: res._id }
  }
}

async function main() {
  const slugArg = process.argv[2]
  if (!slugArg) {
    console.error('Usage: node scripts/import-post-from-exports.js <slug>')
    process.exit(2)
  }
  const filePath = path.join(process.cwd(), 'exports', 'posts', `${slugArg}.json`)
  if (!fs.existsSync(filePath)) {
    console.error('Export JSON not found:', filePath)
    process.exit(3)
  }
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const result = await upsertPostFromExport(json)
  console.log(`✔ ${result.action}: ${slugArg} (ID: ${result.id})`)
}

// Ensure global fetch for Node < 18
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('Import failed:', e.message); process.exit(1) })
