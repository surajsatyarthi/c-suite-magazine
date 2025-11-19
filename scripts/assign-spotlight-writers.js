#!/usr/bin/env node
// Assign the 16 CXO spotlight interviews to 4 writers equally (round-robin)
// Reads public/spotlight.json and patches post.writer
// Usage: node scripts/assign-spotlight-writers.js --apply

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const APPLY = process.argv.includes('--apply')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}
if (!token && APPLY) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local for apply mode.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function readSpotlight() {
  const p = path.join(__dirname, '..', 'public', 'spotlight.json')
  const raw = fs.readFileSync(p, 'utf8')
  return JSON.parse(raw)
}

async function getFourWriters() {
  const writers = await client.fetch('*[_type == "writer"] | order(slug.current asc)[0...4]{ _id, name, slug }')
  if (!writers || writers.length < 4) throw new Error('Need at least 4 writers to assign spotlight posts')
  return writers
}

function slugFromHref(href) {
  try {
    const parts = href.split('/').filter(Boolean)
    return parts[parts.length - 1]
  } catch {
    return null
  }
}

async function assign() {
  const spotlight = readSpotlight()
  const writers = await getFourWriters()
  let idx = 0
  let changed = 0
  for (const item of spotlight) {
    const slug = slugFromHref(item.href)
    if (!slug) continue
    const w = writers[idx % writers.length]
    idx++
    const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, writer }', { slug })
    if (!post?._id) { console.warn(`Skip: post not found for ${slug}`); continue }
    if (APPLY) {
      try {
        await client.patch(post._id).set({ writer: { _type: 'reference', _ref: w._id } }).commit()
        changed++
        console.log(`✔ ${slug} → ${w.name}`)
      } catch (e) {
        console.error(`✘ Failed to set writer for ${slug}:`, e?.message || e)
      }
    } else {
      console.log(`DRY-RUN ${slug} → ${w.name}`)
    }
  }
  if (APPLY) console.log(`Done. Assigned writers for ${changed}/${spotlight.length} spotlight posts.`)
}

assign().catch((e) => { console.error('Assign failed:', e?.message || e); process.exit(1) })

