#!/usr/bin/env node
// Script to merge specified categories by reassigning posts to target categories and optionally deleting old ones

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

const merges = [
  { from: 'Automotive & Logistics', to: 'Automotive And Logistics' },
  { from: 'Construction & Mining', to: 'Construction And Mining' },
  { from: 'Money & Finance', to: 'Money And Finance' },
  { from: 'Changemakers', to: 'Changemakers And Sustainability' },
  { from: 'Interview', to: 'Cxo Interview' }
]

async function getCategoryId(title) {
  const cat = await client.fetch(`*[_type == "category" && title == $title][0]{ _id }`, { title })
  return cat?._id
}

async function mergeCategories() {
  for (const merge of merges) {
    const fromId = await getCategoryId(merge.from)
    const toId = await getCategoryId(merge.to)

    if (!fromId) {
      console.log(`Source category not found: ${merge.from}`)
      continue
    }
    if (!toId) {
      console.log(`Target category not found: ${merge.to}`)
      continue
    }

    const posts = await client.fetch(`*[_type == "post" && references($fromId)] { _id, categories }`, { fromId })

    for (const post of posts) {
      let newCategories = (post.categories || []).filter(ref => ref._ref !== fromId)
      if (!newCategories.some(ref => ref._ref === toId)) {
        newCategories.push({ _type: 'reference', _ref: toId })
      }

      await client.patch(post._id)
        .set({ categories: newCategories })
        .commit()
      console.log(`Updated post ${post._id}: merged ${merge.from} to ${merge.to}`)
    }
  }
  console.log('Merging completed.')
}

mergeCategories().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
