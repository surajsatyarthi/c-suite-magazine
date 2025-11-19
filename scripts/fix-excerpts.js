#!/usr/bin/env node
// Auto-fix bad excerpts in Sanity posts by deriving a sanitized summary
// from the first valid body text block.

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

function firstBodyText(body) {
  const blocks = Array.isArray(body) ? body : []
  const textBlock = blocks.find(b => b && b._type === 'block')
  if (!textBlock) return ''
  const text = Array.isArray(textBlock.children)
    ? textBlock.children.map(c => String(c?.text || '')).join(' ')
    : ''
  return text
}

async function patchExcerpt(id, newExcerpt) {
  try {
    await client.patch(id).set({ excerpt: newExcerpt }).commit()
    return true
  } catch (e) {
    console.error(`✖ Patch failed for ${id}: ${e.message}`)
    return false
  }
}

async function main() {
  console.log('Fetching posts from Sanity...')
  const posts = await client.fetch('*[_type == "post"]{ _id, slug, title, excerpt, body }')
  let scanned = 0
  let updated = 0
  let skipped = 0
  for (const p of posts) {
    scanned++
    const cleaned = sanitizeExcerpt(p.excerpt)
    const needsFix = !cleaned || isImageLine(p.excerpt)
    if (!needsFix) { skipped++; continue }

    const fb = firstBodyText(p.body)
    const fallback = sanitizeExcerpt(fb)
    const candidate = fallback || ''
    if (!candidate) { skipped++; continue }
    const newExcerpt = candidate.substring(0, 200)
    const ok = await patchExcerpt(p._id, newExcerpt)
    if (ok) {
      updated++
      // small throttle to avoid rate limits
      await new Promise(r => setTimeout(r, 120))
      console.log(`✔ Updated: ${p.slug?.current} — "${p.title}"`)
    } else {
      skipped++
    }
  }
  console.log(`\nDone. Scanned: ${scanned}, Updated: ${updated}, Skipped: ${skipped}.`)
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Auto-fix failed:', e)
  process.exit(1)
})

