#!/usr/bin/env node
// Backfill script: assigns categories and tags to existing posts in Sanity
// - Heuristics based on title, excerpt, and image alt
// - Ensures each post has at least one tag (used for card badges)

const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const CATEGORY_KEYWORDS = [
  ['cxo-interview', [/interview/i, /executive interview/i, /cxo/i]],
  ['innovation', [/innovation/i, /innovative/i, /disruption/i]],
  ['money-finance', [/finance/i, /financial/i, /cfo/i, /investment/i, /bank/i, /bfsi/i]],
  ['sustainability', [/sustainability/i, /esg/i, /green/i, /environment/i]],
  ['technology', [/technology/i, /ai/i, /artificial intelligence/i, /machine learning/i, /digital/i, /it/i]],
  ['leadership', [/leadership/i, /leader/i, /ceo/i]],
  ['startups', [/startup/i, /entrepreneur/i, /founder/i]],
  ['healthcare', [/healthcare/i, /hospital/i, /medical/i, /pharma/i]],
  ['education', [/education/i, /school/i, /university/i, /learning/i]],
  ['retail', [/retail/i, /ecommerce/i, /consumer/i]],
  ['manufacturing', [/manufacturing/i, /factory/i, /industrial/i]],
  ['engineering', [/engineering/i, /engineer/i]],
  ['science-technology', [/science/i, /research/i]],
  ['energy', [/energy/i, /power/i, /oil/i, /gas/i, /renewable/i]],
  ['property-real-estate', [/real estate/i, /property/i]],
  ['automotive-logistics', [/automotive/i, /logistics/i, /supply chain/i]],
  ['professional-services', [/consulting/i, /advisory/i, /professional/i]],
  ['opinion', [/opinion/i, /editorial/i, /viewpoint/i]],
]

function pickCategoryFromText(text) {
  if (!text) return null
  for (const [slug, patterns] of CATEGORY_KEYWORDS) {
    if (patterns.some((p) => p.test(text))) return slug
  }
  return null
}

function pickSecondaryCategory(text, excludeSlug) {
  if (!text) return null
  for (const [slug, patterns] of CATEGORY_KEYWORDS) {
    if (slug === excludeSlug) continue
    if (patterns.some((p) => p.test(text))) return slug
  }
  return null
}

async function getCategoryRef(slug) {
  if (!slug) return null
  const cat = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id, title }', { slug })
  return cat?._id ? { _type: 'reference', _ref: cat._id } : null
}

function deriveTags({ title, excerpt, categorySlug }) {
  const tags = new Set()
  // Primary tag from category
  if (categorySlug === 'cxo-interview') tags.add('CxO Interview')
  else if (categorySlug) tags.add(categorySlug.replace(/-/g, ' '))
  // Keyword tags
  const addIf = (kw, label) => { if (kw && new RegExp(label, 'i').test(kw)) tags.add(label) }
  const text = `${title || ''} ${excerpt || ''}`
  addIf(text, 'AI')
  addIf(text, 'Sustainability')
  addIf(text, 'Finance')
  addIf(text, 'Leadership')
  addIf(text, 'Innovation')
  addIf(text, 'Supply Chain')
  addIf(text, 'Women in Leadership')
  // Fallback tag if none
  if (tags.size === 0) tags.add('Insight')
  return Array.from(tags).slice(0, 3)
}

async function backfill() {
  const posts = await client.fetch('*[_type == "post"]{ _id, title, excerpt, slug, categories[]-> { _id, slug }, mainImage{ alt } , tags }')
  let updated = 0
  let skipped = 0
  for (const post of posts) {
    try {
      const hasTags = Array.isArray(post.tags) && post.tags.length > 0
      const hasCategory = Array.isArray(post.categories) && post.categories.length > 0

      // Determine category slug
      const text = `${post.title} ${post.excerpt} ${post.mainImage?.alt || ''}`
      const existingSlugs = (post.categories || []).map(c => c?.slug?.current || c?.slug).filter(Boolean)
      let categorySlug = existingSlugs[0] || pickCategoryFromText(text) || 'opinion'

      // If the post is CXO Interview, add a second, non-CXO industry category when available
      let secondarySlug = null
      if (categorySlug === 'cxo-interview' || existingSlugs.includes('cxo-interview')) {
        secondarySlug = pickSecondaryCategory(text, 'cxo-interview')
      }

      const tags = deriveTags({ title: post.title, excerpt: post.excerpt, categorySlug })

      const patch = {}
      // Ensure primary category present
      if (!hasCategory || !post.categories?.[0]?._id) {
        const ref = await getCategoryRef(categorySlug)
        if (ref) patch.categories = [ref]
      } else {
        patch.categories = post.categories.map(c => ({ _type: 'reference', _ref: c._id }))
      }
      // Add secondary industry category if not already present
      if (secondarySlug && !existingSlugs.includes(secondarySlug)) {
        const secondaryRef = await getCategoryRef(secondarySlug)
        if (secondaryRef) {
          patch.categories = (patch.categories || post.categories.map(c => ({ _type: 'reference', _ref: c._id })) || [])
          patch.categories.push(secondaryRef)
        }
      }
      if (!hasTags) patch.tags = tags

      if (Object.keys(patch).length === 0) {
        skipped++
        continue
      }

      await client.patch(post._id).set(patch).commit()
      updated++
      // Avoid rate limits
      await new Promise((r) => setTimeout(r, 80))
    } catch (e) {
      console.warn(`Failed to backfill ${post.slug?.current || post._id}:`, e.message)
    }
  }
  console.log(`Backfill complete. Updated: ${updated}, Skipped: ${skipped}`)
}

backfill().catch((e) => { console.error(e); process.exit(1) })
