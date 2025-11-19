#!/usr/bin/env node
// Backfill editors for all posts that do not yet have an editor assigned.
// - Ensures editor identities exist as writers in Sanity
// - Assigns editors in a round-robin manner across all posts missing `editor`
// Usage: node scripts/backfill-editors.js

const { createClient } = require('@sanity/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const EDITORS = [
  { name: 'Priya Raman', slug: 'priya-raman' },
  { name: 'Bhavesh Aggarwal', slug: 'bhavesh-aggarwal' },
  { name: 'Cal Riley', slug: 'cal-riley' },
  { name: 'Bryce Tully', slug: 'bryce-tully' },
  { name: 'Bill Faruki', slug: 'bill-faruki' },
]

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function getPostsMissingEditor() {
  return client.fetch('*[_type == "post" && !defined(editor)]{ _id, title, slug }')
}

async function run() {
  const posts = await getPostsMissingEditor()
  if (!posts.length) {
    console.log('All posts already have an editor assigned. Nothing to do.')
    return
  }
  console.log(`Found ${posts.length} post(s) missing editor. Assigning now...`)

  // Resolve editor IDs
  const editorIds = []
  for (const ed of EDITORS) {
    const id = await ensureWriter(ed.name, ed.slug)
    editorIds.push({ ...ed, _id: id })
  }

  let i = 0
  for (const post of posts) {
    const pick = editorIds[i % editorIds.length]
    i++
    await client.patch(post._id).set({ editor: { _type: 'reference', _ref: pick._id } }).commit()
    console.log(`✔ Set editor '${pick.name}' for '${post.title}' (/category/cxo-interview/${post.slug?.current || post.slug})`)
  }

  console.log('✅ Backfill complete.')
}

run().catch((e) => {
  console.error('Failed to backfill editors:', e)
  process.exit(1)
})
