#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

function stripSystemKeys(obj) {
  if (Array.isArray(obj)) return obj.map(stripSystemKeys)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      if (k === '_rev' || k === '_createdAt' || k === '_updatedAt') continue
      out[k] = stripSystemKeys(v)
    }
    return out
  }
  return obj
}

function rewriteRefs(obj, authorIdToWriterId) {
  if (Array.isArray(obj)) return obj.map((v) => rewriteRefs(v, authorIdToWriterId))
  if (obj && typeof obj === 'object') {
    if (obj._type === 'reference' && obj._ref && authorIdToWriterId[obj._ref]) {
      return { _type: 'reference', _ref: authorIdToWriterId[obj._ref] }
    }
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      out[k] = rewriteRefs(v, authorIdToWriterId)
    }
    return out
  }
  return obj
}

async function main() {
  const authors = await client.fetch('*[_type == "author"]{ _id, slug }')
  const writers = await client.fetch('*[_type == "writer"]{ _id, slug }')
  const writerIdBySlug = Object.fromEntries(writers.map((w) => [w.slug?.current || w.slug, w._id]))
  const authorIdToWriterId = {}
  for (const a of authors) {
    const slug = a.slug?.current || a.slug
    const writerId = writerIdBySlug[slug]
    if (writerId) authorIdToWriterId[a._id] = writerId
  }

  const docs = await client.fetch('*[_type != "author" && references(*[_type == "author"]._id)]{ _id, _type }')
  if (!docs.length) {
    console.log('No documents to rewrite; no author references found.')
    return
  }
  console.log(`Rewriting author references in ${docs.length} documents...`)
  let updated = 0
  for (const d of docs) {
    const doc = await client.fetch('*[_id == $id][0]', { id: d._id })
    const sanitized = stripSystemKeys(doc)
    const rewritten = rewriteRefs(sanitized, authorIdToWriterId)
    try {
      await client.createOrReplace(rewritten)
      updated++
      console.log(`✔ Rewrote references in ${d._id} (${d._type})`)
    } catch (err) {
      console.warn(`⚠️ Failed to rewrite ${d._id}: ${err.message}`)
    }
  }
  console.log(`Done. Updated=${updated}, Remaining=${docs.length - updated}`)
}

main().catch((err) => {
  console.error('Rewrite failed:', err.message)
  process.exit(1)
})

