#!/usr/bin/env node
// Copy post author references to writer references, preserving IDs.
// Usage:
//   SANITY_WRITE_TOKEN=<token> node scripts/copy-author-to-writer.js [--unset-author]

const { createClient } = require('@sanity/client')
const path = require('path')

try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

if (!token) {
  console.error('Missing write token. Set SANITY_API_TOKEN or SANITY_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(flag) {
  const idx = process.argv.indexOf(flag)
  return idx > -1 ? true : false
}

async function fetchPostsNeedingCopy() {
  const query = `*[_type == "post" && defined(author._ref) && !defined(writer._ref)] | order(_createdAt asc) {
    _id,
    title,
    "slug": slug.current,
    author-> { _id, name, slug }
  }`
  return client.fetch(query)
}

async function ensureWriterFromAuthor(author) {
  if (!author) return undefined
  const slug = author?.slug?.current || author?.slug || (author?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const name = author?.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function main() {
  const UNSET_AUTHOR = getArg('--unset-author')
  const posts = await fetchPostsNeedingCopy()
  if (!posts.length) {
    console.log('No posts need writer copy. Either no author refs or writer already set.')
    process.exit(0)
  }

  let updated = 0
  for (const p of posts) {
    const writerId = await ensureWriterFromAuthor(p.author)
    if (!writerId) {
      console.warn(`Skipping ${p._id}: cannot resolve writer from author`)
      continue
    }
    const patch = client.patch(p._id).set({ writer: { _type: 'reference', _ref: writerId } })
    const applied = UNSET_AUTHOR ? patch.unset(['author']).commit() : patch.commit()
    await applied
    updated++
    console.log(`✔ Set writer=${p.author?.name || 'unknown'} on '${p.title}' (/article/${p.slug})${UNSET_AUTHOR ? ' and unset author' : ''}`)
  }
  console.log(`\nSummary: updated=${updated}, total=${posts.length}`)
}

// Ensure global fetch for older Node environments
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((err) => {
  console.error('copy-author-to-writer failed:', err && err.message ? err.message : err)
  process.exit(2)
})
