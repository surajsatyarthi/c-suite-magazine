#!/usr/bin/env node
// Auto-fix bad excerpts in Sanity posts by deriving a sanitized summary
// from the first valid body text block.

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
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
  let fullText = ''
  
  for (const b of blocks) {
    if (b && b._type === 'block') {
      const text = Array.isArray(b.children)
        ? b.children.map(c => String(c?.text || '')).join(' ')
        : ''
      fullText += text + ' '
      // Stop once we have enough for a good excerpt
      if (fullText.length > 300) break
    }
  }
  return fullText.trim()
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
  console.log('Fetching posts and CSAs from Sanity...')
  const query = '*[_type in ["post", "csa"] && !(_id in path("drafts.**"))]{ _id, _type, "slug": slug.current, title, excerpt, body }'
  const articles = await client.fetch(query)
  
  let scanned = 0
  let updated = 0
  let skipped = 0

  for (const a of articles) {
    scanned++
    const cleaned = sanitizeExcerpt(a.excerpt)
    const needsFix = !cleaned || isImageLine(a.excerpt) || cleaned.length < 10

    if (!needsFix) { 
      skipped++
      continue 
    }

    const bodyText = firstBodyText(a.body)
    const candidate = sanitizeExcerpt(bodyText)
    
    if (!candidate) { 
      skipped++
      continue 
    }

    const newExcerpt = candidate.substring(0, 197) + (candidate.length > 200 ? '...' : '')
    
    const ok = await patchExcerpt(a._id, newExcerpt)
    if (ok) {
      updated++
      console.log(`✔ Updated [${a._type}]: ${a.slug} — "${a.title}"`)
      // small throttle to avoid rate limits
      await new Promise(r => setTimeout(r, 200))
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

