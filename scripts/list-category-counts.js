#!/usr/bin/env node
// List all categories with the number of articles referencing each (Sanity)

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

    if (!cats?.length) {
      console.log('No categories found.')
      process.exit(0)
    }

    console.log(`Found ${cats.length} categories:`)
    for (const c of cats) {
      const slug = c.slug || 'none'
      const count = typeof c.postCount === 'number' ? c.postCount : 0
      console.log(`${c.title} (${slug}): ${count}`)
    }
    process.exit(0)
  } catch (err) {
    console.error('Failed to list category counts:', err && err.message ? err.message : err)
    process.exit(2)
  }
})()

