#!/usr/bin/env node
// Delete all posts with publishedAt before 2020-01-01
// Usage: node scripts/purge-posts-before-2020.js

const { createClient } = require('@sanity/client')
const path = require('path')

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('Missing write token. Set SANITY_API_TOKEN in .env.local to delete data.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function main() {
  const cutoff = '2020-01-01T00:00:00Z'
  console.log(`Scanning for posts before ${cutoff}...`)
  const posts = await client.fetch(
    '*[_type == "post" && defined(publishedAt) && publishedAt < dateTime($cutoff)] | order(publishedAt asc){ _id, title, slug, publishedAt }',
    { cutoff }
  )
  console.log(`Found ${posts.length} post(s) to delete.`)
  let deleted = 0
  for (const p of posts) {
    try {
      await client.delete(p._id)
      console.log(`🗑️ Deleted: ${p.title || p._id} (${p.slug?.current || 'no-slug'}) — publishedAt=${p.publishedAt}`)
      deleted++
      await new Promise(r => setTimeout(r, 75))
    } catch (e) {
      console.error(`Failed to delete ${p._id}:`, e.message)
    }
  }
  console.log(`Done. Deleted ${deleted} post(s) before 2020.`)
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('Fatal purge error:', e); process.exit(1) })

