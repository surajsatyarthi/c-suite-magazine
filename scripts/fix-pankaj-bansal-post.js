#!/usr/bin/env node
// Fix the Pankaj Bansal post:
// - Restore previous title to "Pankaj Bansal"
// - Change writer to an existing writer (Raj Patel)
// - Remove any inline "By Pankaj Bansal" or trailing "—/– Mr. Bansal" from body blocks

const { createClient } = require('@sanity/client')
const path = require('path')

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function getOrCreateWriter(name, slug) {
const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return { _type: 'reference', _ref: existing._id }
const created = await client.create({ _type: 'writer', name, slug: { _type: 'slug', current: slug } })
  return { _type: 'reference', _ref: created._id }
}

function cleanBodyBlocks(blocks) {
  if (!Array.isArray(blocks)) return []
  const cleaned = []
  for (const blk of blocks) {
    if (blk?._type !== 'block' || !Array.isArray(blk.children)) {
      cleaned.push(blk)
      continue
    }
    const text = blk.children.map(c => c?.text || '').join('')
    // Skip blocks that are just "By Pankaj Bansal" or variants
    const normalized = text.trim().toLowerCase()
    const isByline = normalized === 'by pankaj bansal' || normalized === 'pankaj bansal'
    if (isByline) continue

    // Remove trailing "— Mr. Bansal" / "– Mr. Bansal" / "- Mr. Bansal"
    const replaced = text
      .replace(/[\-–—]\s*mr\.\s*bansal\s*$/i, '')
      .replace(/\s+$/, '')

    const newChildren = []
    let pending = replaced
    // Rebuild children as a single span preserving marks where possible (drop marks)
    newChildren.push({ _type: 'span', text: pending, marks: [] })

    cleaned.push({ ...blk, children: newChildren })
  }
  return cleaned
}

async function run() {
  const slug = 'pankaj-bansal'
  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, body }', { slug })
  if (!post?._id) {
    console.error('Post not found for slug:', slug)
    process.exit(1)
  }

  // Target writer assumption: Raj Patel (can be adjusted later)
  const writerRef = await getOrCreateWriter('Raj Patel', 'raj-patel')

  const newTitle = 'Pankaj Bansal'
  const newBody = cleanBodyBlocks(post.body || [])

  const res = await client.patch(post._id)
.set({ title: newTitle, writer: writerRef, body: newBody })
    .commit()

  console.log('Patched post:', res._id)
  console.log('Title set to:', newTitle)
console.log('Writer set to: Raj Patel')
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

run().catch(err => { console.error(err); process.exit(1) })
