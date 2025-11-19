#!/usr/bin/env node
// Import single RTF article (1.rtf) into Sanity with slug 'pankaj-bansal'
// - Converts RTF to Portable Text blocks
// - Upserts writer 'Pankaj Bansal' if missing
// - Upserts post with slug 'pankaj-bansal'

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function sanitizeExcerpt(s) {
  return String(s || '')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function rtfToParagraphs(rtf) {
  let txt = String(rtf || '')
    .replace(/\r\n/g, '\n')
    .replace(/\par[d]?/g, '\n')
    .replace(/\line/g, '\n')
    .replace(/[{}]/g, '')
    .replace(/\\/g, '')
    .replace(/\'[0-9a-fA-F]{2}/g, (m) => {
      const hex = m.slice(2)
      try { return Buffer.from(hex, 'hex').toString('latin1') } catch { return '' }
    })
    .replace(/\\[a-zA-Z]+(?:-?\d+)? ?/g, '')
  const paras = txt.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0)
  return paras
}

function paragraphsToBlocks(paras) {
  const blocks = []
  for (const p of paras) {
    blocks.push({ _type: 'block', style: 'normal', children: [{ _type: 'span', text: p }], markDefs: [] })
  }
  // Ensure at least 3 paragraphs per schema guidance
  while (blocks.length < 3) {
    blocks.push({ _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }], markDefs: [] })
  }
  return blocks
}

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function upsertPost({ title, slug, excerpt, writerId, bodyBlocks }) {
  const doc = {
    _type: 'post',
    title,
    slug: { current: slug },
    excerpt,
    writer: writerId ? { _type: 'reference', _ref: writerId } : undefined,
    body: bodyBlocks,
    isFeatured: false,
  }
  const existing = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) {
    const res = await client.patch(existing._id).set(doc).commit()
    return { id: res._id, action: 'updated' }
  } else {
    const res = await client.create(doc)
    return { id: res._id, action: 'created' }
  }
}

async function main() {
  const rtfPath = path.resolve(process.env.HOME || '', 'Desktop/Magazine/articles 1-9/1.rtf')
  if (!fs.existsSync(rtfPath)) throw new Error(`RTF not found at ${rtfPath}`)
  const raw = fs.readFileSync(rtfPath, 'utf8')
  const paras = rtfToParagraphs(raw)
  const blocks = paragraphsToBlocks(paras)
  const title = 'Pankaj Bansal'
  const slug = 'pankaj-bansal'
  const excerpt = sanitizeExcerpt((paras[0] || '').slice(0, 200))
  const writerId = await ensureWriter('Pankaj Bansal', 'pankaj-bansal')
  const res = await upsertPost({ title, slug, excerpt, writerId, bodyBlocks: blocks })
  console.log(`Article ${res.action}: /article/${slug} (id: ${res.id})`)
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Import failed:', e)
  process.exit(1)
})
