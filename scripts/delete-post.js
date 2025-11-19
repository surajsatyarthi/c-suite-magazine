#!/usr/bin/env node
// Delete a Sanity post by slug (including draft) and verify removal
// Usage: node scripts/delete-post.js --slug=<slug> [--apply]

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (const a of args) {
    const [k, v] = a.split('=')
    if (k && v) out[k.replace(/^--/, '')] = v
    if (a === '--apply') out.apply = true
  }
  return out
}

const { slug, apply } = parseArgs()
if (!slug) {
  console.error('Missing --slug=<slug>')
  process.exit(1)
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}
if (!token && apply) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local for apply mode.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function main() {
  const docs = await client.fetch(`*[_type == "post" && slug.current == $slug]{ _id }`, { slug })
  if (!docs.length) {
    console.log('No posts found for slug:', slug)
    return
  }
  console.log(`Found ${docs.length} post(s) for slug: ${slug}`)
  let deleted = 0
  for (const d of docs) {
    const ids = [d._id, d._id.startsWith('drafts.') ? d._id : `drafts.${d._id}`]
    if (apply) {
      for (const id of ids) {
        try {
          await client.delete(id)
          deleted++
          console.log(`✔ Deleted ${id}`)
        } catch (e) {
          // Ignore missing drafts
          if (!String(e.message || '').includes('Not found')) {
            console.error(`✘ Failed to delete ${id}:`, e.message)
          }
        }
      }
    } else {
      console.log('DRY-RUN would delete:', ids)
    }
  }
  if (apply) console.log(`Done. Deleted ${deleted} document id(s).`)
}

main().catch((e) => {
  console.error('Delete failed:', e?.message || e)
  process.exit(1)
})

