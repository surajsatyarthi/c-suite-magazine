#!/usr/bin/env node
// Assign a writer (stored in the `writer` field) to a post by slug.
// Usage:
//   SANITY_WRITE_TOKEN=<token> node scripts/assign-writer.js --slug angelina-usanova --writer priya-raman

const { createClient } = require('@sanity/client')
const path = require('path')
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN

if (!token) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(flag) {
  const idx = process.argv.indexOf(flag)
  return idx > -1 ? process.argv[idx + 1] : undefined
}

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function main() {
  const postSlug = getArg('--slug')
  const writerSlug = getArg('--writer')
  const writerName = getArg('--name') || (writerSlug ? writerSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : undefined)

  if (!postSlug || !writerSlug) {
    console.error('Usage: node scripts/assign-writer.js --slug <post-slug> --writer <writer-slug> [--name <Writer Name>]')
    process.exit(1)
  }

  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title }', { slug: postSlug })
  if (!post?._id) {
    console.error(`Post not found for slug: ${postSlug}`)
    process.exit(1)
  }

  const writerId = await ensureWriter(writerName || writerSlug, writerSlug)
  const res = await client.patch(post._id).set({ writer: { _type: 'reference', _ref: writerId } }).commit()
  console.log(`✔ Assigned writer '${writerName || writerSlug}' to '${post.title}' (/category/<category>/${postSlug}) [doc: ${res._id}]`)
}

main().catch((e) => { console.error('Assignment failed:', e.message); process.exit(1) })
