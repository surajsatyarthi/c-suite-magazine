#!/usr/bin/env node
// Rename a category's visible title in Sanity (e.g., Cxo Interview → CXO Interview)

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN || undefined
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_DATASET environment variables.')
  process.exit(1)
}
if (!token) {
  console.error('Missing write token (SANITY_WRITE_TOKEN). Set in .env.local to modify data.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const TARGET_SLUG = 'cxo-interview'
const NEW_TITLE = 'CXO Interview'

async function run() {
  const category = await client.fetch(
    `*[_type == "category" && slug.current == $slug][0]{ _id, title, slug }`,
    { slug: TARGET_SLUG }
  )

  if (!category?._id) {
    // Fallback: try by old title capitalization
    const byTitle = await client.fetch(
      `*[_type == "category" && title match $title][0]{ _id, title, slug }`,
      { title: 'Cxo Interview' }
    )
    if (!byTitle?._id) {
      console.log('Category not found for slug or title: cxo-interview / Cxo Interview')
      return
    }
    category._id = byTitle._id
    category.title = byTitle.title
  }

  if (category.title === NEW_TITLE) {
    console.log(`Title already set to ${NEW_TITLE}. No changes needed.`)
    return
  }

  await client.patch(category._id).set({ title: NEW_TITLE }).commit()
  console.log(`Updated category ${category._id}: '${category.title}' → '${NEW_TITLE}'`)
}

run().catch(err => {
  console.error('Error:', err && err.message ? err.message : err)
  process.exit(1)
})

