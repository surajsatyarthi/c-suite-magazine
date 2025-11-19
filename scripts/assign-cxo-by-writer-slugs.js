#!/usr/bin/env node
const { createClient } = require('@sanity/client')
try { require('dotenv').config(); require('dotenv').config({ path: '.env.local' }) } catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'

if (!projectId || !dataset) { console.error('Missing SANITY project/dataset env'); process.exit(1) }
if (!token) { console.error('Missing write token'); process.exit(2) }

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const CXO_SLUGS = [
  'angelina-usanova','olga-denysiuk','stoyana-natseva','brianne-howey','dr-basma-ghandourah','erin-krueger',
  'bill-faruki','pankaj-bansal','supreet-nagi','swami-aniruddha','bryce-tully','cal-riley',
  'john-zangardi','bryan-smeltzer','dean-fealk','benjamin-borketey'
]

async function getCategoryId(slug) {
  const doc = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug })
  return doc?._id || null
}

async function run() {
  const cxoId = await getCategoryId('cxo-interview')
  if (!cxoId) { console.error('Category not found: cxo-interview'); process.exit(3) }

  const posts = await client.fetch(
    '*[_type == "post" && writer->slug.current in $slugs]{ _id, title, categories[]->{ _id, slug } }',
    { slugs: CXO_SLUGS }
  )

  let updated = 0
  let skipped = 0

  for (const post of posts) {
    const existing = Array.isArray(post.categories) ? post.categories : []
    const hasCxo = existing.some((c) => (c?.slug?.current || c?.slug) === 'cxo-interview')
    if (hasCxo) { skipped++; continue }

    const newRefs = existing.filter((c) => c?._id).map((c) => ({ _type: 'reference', _ref: c._id }))
    newRefs.push({ _type: 'reference', _ref: cxoId })

    try {
      await client.patch(post._id).set({ categories: newRefs }).commit()
      updated++
      await new Promise((r) => setTimeout(r, 50))
      console.log(`✔ Added cxo-interview: ${post.title}`)
    } catch (err) {
      console.error(`✖ Failed for ${post.title}:`, err && err.message ? err.message : err)
    }
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}, Total: ${posts.length}`)
}

run().catch((e) => { console.error('Fatal:', e && e.message ? e.message : e); process.exit(9) })

