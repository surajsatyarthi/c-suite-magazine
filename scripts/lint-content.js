#!/usr/bin/env node
// Lint Sanity posts: flag image-only excerpts, empty sanitized excerpts,
// weak bodies (too few text blocks), and first-paragraph anomalies.

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function sanitizeExcerpt(raw) {
  if (!raw) return ''
  return String(raw)
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function isImageLine(s) {
  const raw = String(s || '').trim()
  return /^!\[[^\]]*\]\([^\)]*\)$/.test(raw) || /\.(jpg|jpeg|png|gif|webp|svg)\b/i.test(raw)
}

async function main() {
  const posts = await client.fetch('*[_type == "post"]{ _id, slug, title, excerpt, body }')
  let issues = 0
  for (const p of posts) {
    const id = p._id
    const slug = p.slug?.current
    const title = p.title
    const cleanedExcerpt = sanitizeExcerpt(p.excerpt)
    const excerptBad = !cleanedExcerpt || isImageLine(p.excerpt)
    const blocks = Array.isArray(p.body) ? p.body : []
    const textBlocks = blocks.filter(b => b?._type === 'block')
    const fewTextBlocks = textBlocks.length < 3
    const firstText = textBlocks[0]?.children?.map(c => String(c?.text || '')).join(' ') || ''
    const firstBad = !sanitizeExcerpt(firstText) || isImageLine(firstText)

    const flags = []
    if (excerptBad) flags.push('bad_excerpt')
    if (fewTextBlocks) flags.push('weak_body')
    if (firstBad) flags.push('bad_first_paragraph')

    if (flags.length) {
      issues++
      console.log(`⚠ ${id} slug=${slug} title="${title}": ${flags.join(', ')}`)
    }
  }
  console.log(`\nScan complete. ${issues} post(s) flagged.`)
}

main().catch((e) => {
  console.error('Lint failed:', e)
  process.exit(1)
})

