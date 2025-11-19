#!/usr/bin/env node
// Verify dataset state after author->writer migration.
// Prints counts for author docs, writer docs, posts with writer references,
// and lists up to 10 remaining author docs if any.

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

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function main() {
  const counts = await client.fetch('{ "author": count(*[_type == "author"]), "writer": count(*[_type == "writer"]), "postsWithWriter": count(*[_type == "post" && defined(writer._ref)]) }')
  console.log('Counts:', counts)

  if (counts.author > 0) {
    const remaining = await client.fetch('*[_type == "author"][0...10]{ _id, name, slug }')
    console.log('Remaining author docs (showing up to 10):')
    for (const r of remaining) {
      console.log(`- ${r._id} | ${r.name || '(no name)'} | ${r.slug?.current || '(no slug)'}`)
    }
    process.exitCode = 2
  } else {
    console.log('✔ No author docs remain. Migration looks complete.')
  }
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((err) => { console.error('Verification failed:', err.message || err); process.exit(1) })

