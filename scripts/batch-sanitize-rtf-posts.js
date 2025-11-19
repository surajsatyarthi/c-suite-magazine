#!/usr/bin/env node
// Batch sanitize RTF-imported posts for seven spotlight articles
// - Removes duplicate title as first paragraph
// - Normalizes punctuation and fixes common RTF artifacts
// - Safe, idempotent text transforms applied to Portable Text blocks
//
// Usage: node scripts/batch-sanitize-rtf-posts.js [--dry]
// Optional: --only=<slug> to limit to single article

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

const TARGET_SLUGS = [
  'pankaj-bansal',
  'stoyana-natseva',
  'dr-basma-ghandourah',
  'john-zangardi',
  'swami-aniruddha',
  'supreet-nagi',
  'bryce-tully',
]

const argv = process.argv.slice(2)
const isDryRun = argv.some(a => a === '--dry')
const onlyArg = argv.find(a => a.startsWith('--only='))
const onlySlug = onlyArg ? onlyArg.split('=')[1] : null

function normalizeSpace(s) {
  return String(s || '').replace(/\s+/g, ' ').replace(/\s+,/g, ',').replace(/\s+\./g, '.').trim()
}

function sanitizeText(t) {
  let s = String(t || '')
  // Fix common RTF artifact seen in imports: "Moments me," -> "Moments;"
  s = s.replace(/\b(Moments)\s+me,\s*/gi, '$1; ')
  // Remove doubled punctuation
  s = s.replace(/,,+/g, ',').replace(/\.\.+/g, '.').replace(/;;+/g, ';')
  // Collapse spaces pacing punctuation
  s = s.replace(/\s+,/g, ',').replace(/\s+;/g, ';').replace(/\s+\./g, '.')
  // Normalize multiple spaces
  s = s.replace(/\s{2,}/g, ' ')
  return s
}

function blocksToText(block) {
  if (!block || !Array.isArray(block.children)) return ''
  return block.children.map(ch => String(ch?.text || '')).join('')
}

function roughlyEquals(a, b) {
  const clean = (x) => String(x || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
  return clean(a) === clean(b)
}

function isLikelyHeading(s) {
  const text = String(s || '').trim()
  if (!text) return false
  const long = text.length >= 80
  const words = text.split(/\s+/).filter(Boolean)
  const caps = words.filter(w => /^[A-Z][a-z]/.test(w)).length
  const capRatio = words.length ? (caps / words.length) : 0
  const hasColon = text.includes(':')
  const endsWithSentencePunct = /[.!?]$/.test(text)
  // Heuristic: long, title-cased phrase (often with colon), not ending in punctuation
  return long && (hasColon || capRatio >= 0.5) && !endsWithSentencePunct
}

async function fetchPost(slug) {
  return client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, slug, body }', { slug })
}

async function patchBody(id, body) {
  if (isDryRun) return { _id: id }
  return client.patch(id).set({ body }).commit()
}

async function sanitizePost(slug) {
  const post = await fetchPost(slug)
  if (!post?._id) {
    console.warn(`Skip: not found -> ${slug}`)
    return { slug, updated: false, reason: 'not_found' }
  }

  const originalBlocks = Array.isArray(post.body) ? post.body : []
  if (!originalBlocks.length) {
    console.warn(`Skip: empty body -> ${slug}`)
    return { slug, updated: false, reason: 'empty_body' }
  }

  let blocks = [...originalBlocks]
  let changes = 0

  // 1) Remove duplicate title as first paragraph
  const firstText = blocks.find(b => b?._type === 'block')
  if (firstText) {
    const text0 = blocksToText(firstText)
    if (roughlyEquals(text0, post.title) || text0.startsWith(post.title) || isLikelyHeading(text0)) {
      blocks = blocks.filter((b, i) => i !== blocks.indexOf(firstText))
      changes++
    }
  }

  // 2) Sanitize text in all block children
  const newBlocks = blocks.map(block => {
    if (block && Array.isArray(block.children)) {
      const newChildren = block.children.map(ch => {
        if (ch && typeof ch.text === 'string') {
          const before = ch.text
          let after = sanitizeText(before)
          after = normalizeSpace(after)
          if (after !== before) changes++
          return { ...ch, text: after }
        }
        return ch
      })
      return { ...block, children: newChildren }
    }
    return block
  })

  if (changes === 0) {
    return { slug, updated: false, reason: 'no_changes' }
  }

  await patchBody(post._id, newBlocks)
  return { slug, updated: true, changes }
}

async function main() {
  const targets = onlySlug ? [onlySlug] : TARGET_SLUGS
  const results = []
  for (const slug of targets) {
    try {
      const res = await sanitizePost(slug)
      results.push(res)
      // small throttle to avoid rate limits
      await new Promise(r => setTimeout(r, 100))
      const tag = res.updated ? '✔' : '—'
      if (res.updated) console.log(`${tag} Updated ${slug} (changes: ${res.changes})`)
      else console.log(`${tag} ${slug}: ${res.reason}`)
    } catch (e) {
      console.error(`✖ Failed for ${slug}:`, e.message)
    }
  }

  const updated = results.filter(r => r.updated).length
  console.log(`\nDone. Targeted: ${targets.length}, Updated: ${updated}. Dry-run: ${isDryRun ? 'yes' : 'no'}.`)
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('Batch sanitize failed:', e); process.exit(1) })
