#!/usr/bin/env node
// Safely migrate Sanity documents from _type:"author" to _type:"writer".
// - Dry-run by default (prints planned changes).
// - Use --apply to perform changes.
// - Preserves document IDs to keep existing post references intact.
// Usage:
//   node scripts/migrate-authors-to-writers.js [--apply] [--batch 50]

const { createClient } = require('@sanity/client')
const path = require('path')

try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('Missing write token. Set SANITY_API_TOKEN or SANITY_WRITE_TOKEN in .env.local to modify data.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function parseArgs() {
  const APPLY = process.argv.includes('--apply')
  const batchFlagIndex = process.argv.findIndex((a) => a === '--batch')
  const batchSize = batchFlagIndex > -1 ? parseInt(process.argv[batchFlagIndex + 1], 10) || 50 : 50
  return { APPLY, batchSize }
}

async function fetchAuthors(offset = 0, limit = 50) {
  const query = `*[_type == "author"] | order(_createdAt asc) [${offset}...${offset + limit}]`
  return client.fetch(query)
}

function prepareWriterDoc(authorDoc) {
  const { _id } = authorDoc
  // Exclude Sanity system fields; keep all custom fields intact
  const { _rev, _createdAt, _updatedAt, _type, ...rest } = authorDoc
  return { _id, _type: 'writer', ...rest }
}

async function migrateBatch(authors, APPLY) {
  if (!authors.length) return { migrated: 0 }
  const tx = client.transaction()
  for (const a of authors) {
    const writerDoc = prepareWriterDoc(a)
    if (APPLY) {
      tx.createOrReplace(writerDoc)
    }
  }
  if (APPLY) {
    await tx.commit({ visibility: 'async' })
  }
  return { migrated: authors.length }
}

async function countByType() {
  const counts = await client.fetch('{ "author": count(*[_type == "author"]), "writer": count(*[_type == "writer"]), "postsWithWriter": count(*[_type == "post" && defined(writer._ref)]) }')
  return counts
}

async function main() {
  const { APPLY, batchSize } = parseArgs()
  const countsBefore = await countByType()
  console.log('Current counts:', countsBefore)

  let offset = 0
  let totalMigrated = 0
  while (true) {
    const authors = await fetchAuthors(offset, batchSize)
    if (!authors.length) break
    console.log(`Processing authors ${offset}..${offset + authors.length - 1}`)
    const { migrated } = await migrateBatch(authors, APPLY)
    totalMigrated += migrated
    offset += batchSize
  }

  console.log(`Planned migrations: ${totalMigrated}`)
  if (!APPLY) {
    console.log('Dry-run complete. Re-run with --apply to perform changes.')
    process.exit(0)
  }

  const countsAfter = await countByType()
  console.log('Counts after migration:', countsAfter)

  if (countsAfter.author > 0) {
    console.warn('Warning: Some author documents remain after migration.')
  } else {
    console.log('✔ All author documents migrated to writer.')
  }
}

// Ensure global fetch for older Node environments
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err)
  process.exit(1)
})

