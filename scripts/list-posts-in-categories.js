#!/usr/bin/env node
// List posts in specific categories to be merged (Sanity)

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

const categoriesToList = ['Philanthropy', 'CEO Woman', 'BFSI', 'Energy'];

(async () => {
  try {
    for (const catTitle of categoriesToList) {
      const category = await client.fetch(`*[_type == "category" && title == $title][0] {
        _id,
        title,
        "slug": slug.current
      }`, { title: catTitle })

      if (!category?._id) {
        console.log(`Category not found: ${catTitle}`)
        continue
      }

      const posts = await client.fetch(`*[_type == "post" && references($catId)] | order(title asc) {
        _id,
        title,
        "slug": slug.current
      }`, { catId: category._id })

      console.log(`\nCategory: ${category.title} (slug: ${category.slug})`)
      console.log(`Posts (${posts.length}):`)
      for (const post of posts) {
        console.log(`- ${post.title} (slug: ${post.slug})`)
      }
    }
    process.exit(0)
  } catch (err) {
    console.error('Failed to list posts:', err && err.message ? err.message : err)
    process.exit(2)
  }
})()