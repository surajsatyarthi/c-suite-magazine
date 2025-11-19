#!/usr/bin/env node
// List all categories with their slugs and post counts

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN || process.env.SANITY_READ_TOKEN || process.env.SANITY_API_TOKEN || undefined
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_DATASET environment variables.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion, useCdn: false })

async function listCategories() {
  const query = `*[_type == "category"]|order(title asc){ _id, title, "slug": slug.current, "postCount": count(*[_type=="post" && references(^._id)]) }`
  const cats = await client.fetch(query)
  console.log(`Found ${cats.length} categories:`)
  for (const c of cats) {
    console.log(`- ${c.title} (${c.slug || 'no-slug'}) | posts: ${c.postCount}`)
  }
}

listCategories().catch(err => {
  console.error('Error:', err && err.message ? err.message : err)
  process.exit(1)
})

