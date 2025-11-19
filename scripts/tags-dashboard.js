#!/usr/bin/env node
// Tags dashboard: prints distribution, long tags, non-normalized variants,
// and any posts with empty/undefined tags.

const { createClient } = require('@sanity/client')
const path = require('path')

try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_READ_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function norm(tag) {
  return String(tag || '').toLowerCase().trim()
}

;(async () => {
  const posts = await client.fetch(`*[_type == "post"]{slug, title, tags}`)
  const freq = new Map()
  const longTags = new Set()
  const variants = new Map() // normalized -> original set
  const emptyTagPosts = []

  for (const p of posts) {
    const t = Array.isArray(p.tags) ? p.tags : []
    if (!t.length) emptyTagPosts.push(p)
    for (const raw of t) {
      const n = norm(raw)
      if (!n) continue
      freq.set(n, (freq.get(n) || 0) + 1)
      if (raw.length > 24) longTags.add(raw)
      const set = variants.get(n) || new Set()
      set.add(raw)
      variants.set(n, set)
    }
  }

  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
  console.log('Tags Dashboard')
  console.log(`- Posts scanned: ${posts.length}`)
  console.log(`- Posts missing tags: ${emptyTagPosts.length}`)
  console.log('- Top tags (normalized):')
  for (const [tag, count] of top) console.log(`  • ${tag} — ${count}`)

  const nonNormalized = [...variants.entries()].filter(([, originals]) => originals.size > 1)
  if (nonNormalized.length) {
    console.log('- Non-normalized variants detected:')
    for (const [n, originals] of nonNormalized) {
      console.log(`  • ${n}: ${[...originals].join(', ')}`)
    }
  } else {
    console.log('- No non-normalized variants found.')
  }

  if (longTags.size) {
    console.log('- Long tags (>24 chars):')
    for (const t of longTags) console.log(`  • ${t}`)
  }

  if (emptyTagPosts.length) {
    console.log('- Posts with empty tags (slug → title):')
    for (const p of emptyTagPosts.slice(0, 20)) {
      const s = p.slug?.current || p.slug
      console.log(`  • ${s} → ${p.title}`)
    }
    if (emptyTagPosts.length > 20) console.log(`  • …and ${emptyTagPosts.length - 20} more`)
  }
})().catch((err) => {
  console.error('Error running tags dashboard:', err.message)
  process.exit(1)
})

