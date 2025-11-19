#!/usr/bin/env node
// Delete a specific post by exact title (case-sensitive)
// Hardcoded for: Darey and Deola Art Alade: Revolutionizing Industries Through Bold Entrepreneurial Vision

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
  const title = 'Darey and Deola Art Alade: Revolutionizing Industries Through Bold Entrepreneurial Vision'
  console.log(`Locating post by title: ${title}`)
  const posts = await client.fetch('*[_type == "post" && title == $title]{ _id, title, slug, publishedAt }', { title })
  if (posts.length === 0) {
    console.log('No matching post found by exact title. Trying case-insensitive match...')
    const postsCI = await client.fetch('*[_type == "post" && lower(title) == lower($title)]{ _id, title, slug, publishedAt }', { title })
    if (postsCI.length === 0) {
      console.log('No matching post found. Nothing to delete.')
      return
    }
    await deleteAll(postsCI)
    return
  }
  await deleteAll(posts)
}

async function deleteAll(posts) {
  console.log(`Found ${posts.length} matching post(s). Proceeding to delete...`)
  let deleted = 0
  for (const p of posts) {
    try {
      await client.delete(p._id)
      console.log(`🗑️ Deleted: ${p.title} (${p.slug?.current || 'no-slug'}) — publishedAt=${p.publishedAt || 'N/A'}`)
      deleted++
      await new Promise(r => setTimeout(r, 75))
    } catch (e) {
      console.error(`Failed to delete ${p._id}:`, e.message)
    }
  }
  console.log(`Done. Deleted ${deleted} post(s).`)
}

// Ensure global fetch
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch(e => { console.error('Fatal delete error:', e); process.exit(1) })

