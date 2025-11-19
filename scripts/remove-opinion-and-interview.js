#!/usr/bin/env node
// Remove special categories (Opinion, CXO Interview) from posts and
// reassign suitable industry categories when possible.
// - Keeps any existing non-special categories
// - Tries to infer a replacement from title/excerpt/image alt using keyword heuristics
// - For CXO interviews, attempts domain->industry mapping via cxo_interviews_spun.json
// - Reports posts that couldn't be mapped to an existing category

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

// Special categories to remove entirely
const SPECIAL_SLUGS = new Set(['opinion', 'cxo-interview'])

// Keyword heuristics excluding special categories
const CATEGORY_KEYWORDS = [
  ['innovation', [/\binnovation\b/i, /\binnovative\b/i, /\bdisruption\b/i]],
  ['money-finance', [/\bfinance\b/i, /\bfinancial\b/i, /\bcfo\b/i, /\binvestment\b/i, /\bbank\b/i, /\bbfsi\b/i]],
  ['sustainability', [/\bsustainability\b/i, /\besg\b/i, /\bgreen\b/i, /\benvironment\b/i]],
  ['technology', [/\btechnology\b/i, /\bai\b/i, /\bartificial intelligence\b/i, /\bmachine learning\b/i, /\bdigital\b/i, /\bit\b/i]],
  ['leadership', [/\bleadership\b/i, /\bleader\b/i, /\bceo\b/i]],
  ['startups', [/\bstartup\b/i, /\bentrepreneur\b/i, /\bfounder\b/i]],
  ['healthcare', [/\bhealthcare\b/i, /\bhospital\b/i, /\bmedical\b/i, /\bpharma\b/i]],
  ['education', [/\beducation\b/i, /\bschool\b/i, /\buniversity\b/i, /\blearning\b/i]],
  ['retail', [/\bretail\b/i, /\becommerce\b/i, /\bconsumer\b/i]],
  ['manufacturing', [/\bmanufacturing\b/i, /\bfactory\b/i, /\bindustrial\b/i]],
  ['engineering', [/\bengineering\b/i, /\bengineer\b/i]],
  ['science-technology', [/\bscience\b/i, /\bresearch\b/i]],
  ['energy', [/\benergy\b/i, /\bpower\b/i, /\boil\b/i, /\bgas\b/i, /\brenewable\b/i]],
  ['property-real-estate', [/\breal estate\b/i, /\bproperty\b/i]],
  ['automotive-logistics', [/\bautomotive\b/i, /\blogistics\b/i, /\bsupply chain\b/i]],
  ['professional-services', [/\bconsulting\b/i, /\badvisory\b/i, /\bprofessional\b/i]],
  ['construction-mining', [/\bconstruction\b/i, /\bmining\b/i, /\binfrastructure\b/i]],
]

// Map external source domains to our CMS category slugs (used for interviews)
const DOMAIN_TO_CATEGORY = {
  'automotive-aviation': 'automotive-logistics',
  'construction-trades': 'construction-mining',
  'commercial-and-professional-services': 'professional-services',
  'education': 'education',
  'science-and-technology': 'science-technology',
  'money-finance': 'money-finance',
}

function pickCategoryFromText(text) {
  if (!text) return null
  for (const [slug, patterns] of CATEGORY_KEYWORDS) {
    if (patterns.some((p) => p.test(text))) return slug
  }
  return null
}

async function getCategoryRefBySlug(slug) {
  if (!slug) return null
  const cat = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug })
  return cat?._id ? { _type: 'reference', _ref: cat._id } : null
}

function uniqueRefs(refs) {
  const seen = new Set()
  const out = []
  for (const r of refs) {
    if (!r?._ref) continue
    if (seen.has(r._ref)) continue
    seen.add(r._ref)
    out.push(r)
  }
  return out
}

async function run() {
  // Optional dataset for CXO mapping
  let spunData = []
  try {
    const jsonPath = path.join(__dirname, '../../cxo interviews spun/cxo_interviews_spun.json')
    spunData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  } catch {
    // If missing, continue without domain mapping
  }

  const posts = await client.fetch(
    '*[_type == "post" && ("opinion" in categories[]->slug.current || "cxo-interview" in categories[]->slug.current)]{ _id, title, slug, excerpt, mainImage{alt}, categories[]->{ _id, slug } }'
  )

  let updated = 0
  let keptOnlyIndustry = 0
  let unmapped = []

  for (const post of posts) {
    try {
      const existing = Array.isArray(post.categories) ? post.categories : []
      const existingSlugs = existing.map((c) => c?.slug?.current || c?.slug).filter(Boolean)
      const nonSpecial = existing.filter((c) => !SPECIAL_SLUGS.has(c?.slug?.current || c?.slug))

      let newRefs = nonSpecial.map((c) => ({ _type: 'reference', _ref: c._id }))

      // If no non-special categories, infer one
      if (newRefs.length === 0) {
        const text = `${post.title || ''} ${post.excerpt || ''} ${post.mainImage?.alt || ''}`
        let inferred = pickCategoryFromText(text)

        // If CXO Interview and not inferred, try spun domain mapping by title
        if ((!inferred) && existingSlugs.includes('cxo-interview') && spunData.length) {
          const match = spunData.find((i) => i.title === post.title)
          if (match) {
            const external = (match.category || '').split('/')
            const domain = external.pop() || ''
            inferred = DOMAIN_TO_CATEGORY[domain] || null
          }
        }

        if (inferred) {
          const ref = await getCategoryRefBySlug(inferred)
          if (ref) newRefs.push(ref)
        } else {
          // Could not infer replacement
          unmapped.push({ id: post._id, title: post.title, slug: post.slug?.current })
        }
      }

      newRefs = uniqueRefs(newRefs)

      await client.patch(post._id)
        .set({ categories: newRefs })
        .commit()
      if (newRefs.length > 0) updated++
      else keptOnlyIndustry++ // zero after removal; counted for reporting as unmapped

      // Avoid rate limits
      await new Promise((r) => setTimeout(r, 80))
    } catch (e) {
      console.warn(`Failed to update ${post.slug?.current || post._id}:`, e.message)
    }
  }

  console.log('\nRemoval and reassignment complete')
  console.log(`Posts updated with industry categories: ${updated}`)
  console.log(`Posts left without categories (unmapped): ${unmapped.length}`)
  if (unmapped.length) {
    console.log('Unmapped posts:')
    for (const u of unmapped) console.log(`- ${u.slug || u.id}: ${u.title}`)
  }
}

run().catch((e) => { console.error(e); process.exit(1) })

