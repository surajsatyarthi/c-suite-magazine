#!/usr/bin/env node
// Create a new Sanity category document: Cover Story
// Requires a write token in env: SANITY_API_TOKEN (or SANITY_WRITE_TOKEN/SANITY_TOKEN)

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_DATASET environment variables.')
  process.exit(1)
}

if (!token) {
  console.error('Missing write token (SANITY_API_TOKEN). Please set SANITY_API_TOKEN in .env.local to create categories.')
  process.exit(2)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const title = 'Cover Story'
const slug = 'cover-story'
const description = 'Featured cover stories and marquee articles'
const color = '#082945'

;(async () => {
  try {
    const exists = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id, title }', { slug })
    if (exists?._id) {
      console.log(`Category already exists: ${exists.title} (slug=${slug})`)
      process.exit(0)
    }

    const doc = {
      _type: 'category',
      title,
      slug: { current: slug },
      description,
      color,
    }

    const created = await client.create(doc)
    console.log(`Created category: ${title} (slug=${slug}) id=${created._id}`)
    process.exit(0)
  } catch (err) {
    console.error('Failed to create category:', err && err.message ? err.message : err)
    process.exit(3)
  }
})()

