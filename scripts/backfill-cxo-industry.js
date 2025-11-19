#!/usr/bin/env node
// Backfill: Ensure every CXO Interview post has a non-"cxo-interview" industry category
// Strategy:
// - Read cxo_interviews_spun.json to infer intended domain for each title
// - Map external domains to our CMS category slugs
// - For posts that only have `cxo-interview`, add the mapped industry category

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Map external source domains to our CMS category slugs
const DOMAIN_TO_CATEGORY = {
  'automotive-aviation': 'automotive-logistics',
  'construction-trades': 'construction-mining',
  'commercial-and-professional-services': 'professional-services',
  'education': 'education',
  // Fallbacks for other possible domains
  'science-and-technology': 'science-technology',
  'money-finance': 'money-finance',
}

async function getCategoryRefBySlug(slug) {
  if (!slug) return null
  const cat = await client.fetch('*[_type == "category" && slug.current == $slug][0]{_id}', { slug })
  return cat?._id ? { _type: 'reference', _ref: cat._id } : null
}

async function run() {
  const jsonPath = path.join(__dirname, '../../cxo interviews spun/cxo_interviews_spun.json')
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  let updated = 0
  let skipped = 0
  let missingCat = 0

  for (const item of data) {
    const title = item.title
    const external = (item.category || '').split('/')
    const domain = external.pop() || ''
    const ourSlug = DOMAIN_TO_CATEGORY[domain]

    try {
      // Find post by title
      const post = await client.fetch('*[_type == "post" && title == $title][0]{ _id, title, categories[]->{slug} }', { title })
      if (!post?._id) { skipped++; continue }

      const slugs = (post.categories || []).map(c => c?.slug?.current).filter(Boolean)
      const hasNonCxo = slugs.some(s => s && s !== 'cxo-interview')
      if (hasNonCxo) { skipped++; continue }

      const categoryRef = await getCategoryRefBySlug(ourSlug)
      if (!categoryRef) { missingCat++; continue }

      await client.patch(post._id)
        .setIfMissing({ categories: [] })
        .insert('after', 'categories[-1]', [categoryRef])
        .commit()
      updated++

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 50))
    } catch (err) {
      console.error(`Error updating "${title}":`, err.message)
    }
  }

  console.log('\nBackfill complete')
  console.log(`Updated posts: ${updated}`)
  console.log(`Skipped (already had industry): ${skipped}`)
  console.log(`Missing category mapping: ${missingCat}`)
}

run().catch(err => { console.error(err); process.exit(1) })

