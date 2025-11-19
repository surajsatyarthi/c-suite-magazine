#!/usr/bin/env node
// Assign distinct editors (as writers) to the five imported interview posts

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

const ASSIGNMENTS = [
  { slug: 'pankaj-bansal', editor: { name: 'Priya Raman', slug: 'priya-raman' } },
  { slug: 'stoyana-natseva', editor: { name: 'Bhavesh Aggarwal', slug: 'bhavesh-aggarwal' } },
  { slug: 'john-zangardi', editor: { name: 'Cal Riley', slug: 'cal-riley' } },
  { slug: 'swami-aniruddha', editor: { name: 'Bryce Tully', slug: 'bryce-tully' } },
  { slug: 'supreet-nagi', editor: { name: 'Bill Faruki', slug: 'bill-faruki' } },
  { slug: 'bryce-tully', editor: { name: 'Priya Raman', slug: 'priya-raman' } },
  { slug: 'dr-basma-ghandourah', editor: { name: 'Cal Riley', slug: 'cal-riley' } },
]

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function assignEditorToPost(slug, editor) {
  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title }', { slug })
  if (!post?._id) {
    console.warn(`Post not found for slug: ${slug}`)
    return
  }
  const editorId = await ensureWriter(editor.name, editor.slug)
  const res = await client.patch(post._id).set({ editor: { _type: 'reference', _ref: editorId } }).commit()
  console.log(`✔ Assigned editor '${editor.name}' to '${post.title}' (/category/cxo-interview/${slug})`)
}

async function main() {
  for (const a of ASSIGNMENTS) {
    try {
      await assignEditorToPost(a.slug, a.editor)
    } catch (e) {
      console.error(`Failed to assign editor for ${a.slug}:`, e.message)
    }
  }
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Assign editors failed:', e)
  process.exit(1)
})
