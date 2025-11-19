#!/usr/bin/env node
// Script to delete specified empty categories from Sanity

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
  console.error('Missing write token. Set SANITY_API_TOKEN in .env.local to delete data.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const categoriesToDelete = [
  'Automotive & Logistics',
  'Construction & Mining',
  'Money & Finance',
  'Changemakers',
  'Business',
  'Events',
  'Interview'
]

async function deleteCategories() {
  for (const title of categoriesToDelete) {
    const category = await client.fetch(`*[_type == "category" && title == $title][0] { _id, "postCount": count(*[_type == "post" && references(^._id)]) }`, { title })

    if (!category?._id) {
      console.log(`Category not found: ${title}`)
      continue
    }

    if (category.postCount > 0) {
      console.log(`Cannot delete ${title}: still has ${category.postCount} posts`)
      continue
    }

    await client.delete(category._id)
    console.log(`Deleted category: ${title}`)
  }
  console.log('Deletion completed.')
}

deleteCategories().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
