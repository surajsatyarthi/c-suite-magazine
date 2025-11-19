#!/usr/bin/env node
// Normalize overused heading styles (h1–h4) in a post body.
// Heuristic: convert heading-styled blocks to 'normal' when they look like sentences.
// Usage:
//   node scripts/normalize-headings.js --slug <slug> --apply
//   node scripts/normalize-headings.js --slug <slug>            # dry run

const { createClient } = require('@sanity/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

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

function blockText(b) {
  if (!b || b._type !== 'block') return ''
  return (Array.isArray(b.children) ? b.children.map((c) => String(c?.text || '')).join(' ') : '').trim()
}

function looksLikeSentence(t) {
  const len = t.length
  const endsWithPunct = /[\.!?]$/.test(t)
  const hasManyCommas = (t.match(/,/g) || []).length >= 2
  const hasSemicolon = /;/.test(t)
  const hasMultipleClauses = /\b(and|but|which|that|because|while|whereas)\b/i.test(t) && /\b\w+\b/.test(t)
  return len >= 120 || endsWithPunct || hasManyCommas || hasSemicolon || hasMultipleClauses
}

function normalizeBlocks(blocks) {
  let changed = 0
  const out = (blocks || []).map((b) => {
    if (b?._type !== 'block') return b
    const t = blockText(b)
    const style = b.style || 'normal'
    if (['h1', 'h2', 'h3', 'h4'].includes(style)) {
      // Convert heading to normal if it looks like a sentence (overuse of headings)
      if (looksLikeSentence(t)) {
        const nb = { ...b, style: 'normal' }
        changed++
        return nb
      }
      // Also downgrade any h1 to h2 within body
      if (style === 'h1') {
        const nb = { ...b, style: 'h2' }
        changed++
        return nb
      }
    }
    return b
  })
  return { blocks: out, changed }
}

async function run() {
  const post = await client.fetch('*[_type=="post" && slug.current==$slug][0]{ _id, title, slug, body }', { slug })
  if (!post?._id) {
    console.error(`Post not found: ${slug}`)
    process.exit(1)
  }
  const { blocks, changed } = normalizeBlocks(post.body)
  if (!changed) {
    console.log(`No heading normalization needed for '${post.title}'.`)
    return
  }
  console.log(`Will normalize ${changed} block(s) in '${post.title}'. apply=${apply}`)
  if (!apply) return
  await client.patch(post._id).set({ body: blocks }).commit()
  console.log('✔ Applied heading normalization.')
}

run().catch((e) => {
  console.error('Failed to normalize headings:', e)
  process.exit(1)
})

