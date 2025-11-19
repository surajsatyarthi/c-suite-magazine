#!/usr/bin/env node
// List all Sanity categories that currently have zero articles referencing them
// Reads env from .env.local if present; token is not required for read-only queries

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_READ_TOKEN || process.env.SANITY_TOKEN || process.env.SANITY_WRITE_TOKEN || undefined
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_DATASET environment variables.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

;(async () => {
  try {
    const cats = await client.fetch(`*[_type == "category"] | order(title asc) {
      _id,
      title,
      "slug": slug.current,
      "postCount": count(*[_type == "post" && references(^._id)])
    }`)

    const empty = (cats || []).filter((c) => (c.postCount || 0) === 0)
    if (!empty.length) {
      console.log('No empty categories found. All categories have at least one article.')
      process.exit(0)
    }

    console.log('Categories without any articles:')
    for (const c of empty) {
      console.log(`- ${c.title} (slug=${c.slug || 'none'})`)
    }
    process.exit(0)
  } catch (err) {
    console.error('Failed to list empty categories:', err && err.message ? err.message : err)
    process.exit(2)
  }
})()

