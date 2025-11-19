#!/usr/bin/env node
// Sanitize a post body: remove embedded HTML, stray quotes, and broken fragments.
// Usage:
//   node scripts/sanitize-post-body.js --slug <slug> --apply

const { createClient } = require('@sanity/client')
const path = require('path')
try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(name, def = undefined) {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return def
  const val = process.argv[idx + 1]
  return val && !val.startsWith('--') ? val : true
}

const slug = getArg('slug')
const apply = !!getArg('apply', false)

if (!slug) {
  console.error('Missing --slug <slug>')
  process.exit(1)
}

function sanitizeText(t) {
  let s = String(t || '')
  // Remove any embedded HTML tags
  s = s.replace(/<\/?[^>]+>/g, ' ')
  // Normalize smart quotes and stray quotes
  s = s.replace(/[“”‘’]/g, '"')
  s = s.replace(/\"\"+/g, '"')
  s = s.replace(/^\s*\"|\"\s*$/g, '')
  // Insert space between lowercase-to-uppercase boundaries (e.g., ChildrenHospital → Children Hospital)
  s = s.replace(/([a-z])([A-Z])/g, '$1 $2')
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function sanitizeBlocks(blocks) {
  let changed = 0
  const out = []
  for (const b of Array.isArray(blocks) ? blocks : []) {
    if (!b || b._type !== 'block') { out.push(b); continue }
    const children = Array.isArray(b.children) ? b.children : []
    const newChildren = []
    for (const c of children) {
      const raw = String(c?.text || '')
      const cleaned = sanitizeText(raw)
      // Drop extremely short broken fragments
      if (!cleaned || cleaned.length < 20) continue
      newChildren.push({ ...c, text: cleaned })
    }
    if (!newChildren.length) {
      // Skip blocks that have no meaningful text after cleanup
      continue
    }
    const style = b.style || 'normal'
    out.push({ ...b, style, children: newChildren })
    changed++
  }
  return { blocks: out, changed }
}

async function run() {
  const post = await client.fetch('*[_type=="post" && slug.current==$slug][0]{ _id, title, slug, body }', { slug })
  if (!post?._id) {
    console.error(`Post not found: ${slug}`)
    process.exit(1)
  }
  const { blocks, changed } = sanitizeBlocks(post.body)
  if (!changed) {
    console.log(`No body cleanup needed for '${post.title}'.`)
    return
  }
  console.log(`Will sanitize ${changed} block(s) in '${post.title}'. apply=${apply}`)
  if (!apply) return
  await client.patch(post._id).set({ body: blocks }).commit()
  console.log('✔ Applied body sanitization.')
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

run().catch((e) => {
  console.error('Failed to sanitize body:', e?.message || e)
  process.exit(1)
})

