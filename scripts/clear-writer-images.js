#!/usr/bin/env node
// Unset profile image for all writers in the dataset
// Usage: node scripts/clear-writer-images.js --apply

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

async function main() {
  const writers = await client.fetch(`*[_type == "writer"]{ _id, name, slug }`)
  if (!writers.length) { console.log('No writers found.'); return }
  let changed = 0
  for (const w of writers) {
    if (APPLY) {
      try {
        await client.patch(w._id).unset(['image']).commit()
        changed++
        console.log(`✔ Cleared image for ${w.name} (${w.slug?.current || w.slug})`)
      } catch (e) {
        console.error(`✘ Failed for ${w._id}:`, e?.message || e)
      }
    } else {
      console.log('DRY-RUN would clear image for:', w._id, w.name)
    }
  }
  if (APPLY) console.log(`Done. Cleared ${changed}/${writers.length} writer images.`)
}

main().catch((e) => { console.error('Clear failed:', e?.message || e); process.exit(1) })

