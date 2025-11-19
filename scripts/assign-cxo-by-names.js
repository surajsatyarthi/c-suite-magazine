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

const NAMES = [
  'Angelina Usanova','Olga Denysiuk','Stoyana Natseva','Brianne Howey','Basma Ghandourah','Erin Krueger',
  'Bill Faruki','Pankaj Bansal','Supreet Nagi','Swami Aniruddha','Bryce Tully','Cal Riley',
  'John Zangardi','Bryan Smeltzer','Dean Fealk','Benjamin Borketey'
]

function nameRegexps() {
  return NAMES.map((n) => new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
}

async function getCategoryId(slug) {
  const doc = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug })
  return doc?._id || null
}

async function run() {
  const cxoId = await getCategoryId('cxo-interview')
  if (!cxoId) { console.error('Category not found: cxo-interview'); process.exit(3) }

  const posts = await client.fetch(
    '*[_type == "post"]{ _id, title, excerpt, categories[]->{ _id, slug } }'
  )

  const regs = nameRegexps()
  const candidates = posts.filter((p) => regs.some((r) => r.test(p.title || '') || r.test(p.excerpt || '')))

  let updated = 0
  let skipped = 0

  for (const post of candidates) {
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

  console.log(`Done. Candidates: ${candidates.length}, Updated: ${updated}, Skipped: ${skipped}`)
}

run().catch((e) => { console.error('Fatal:', e && e.message ? e.message : e); process.exit(9) })

