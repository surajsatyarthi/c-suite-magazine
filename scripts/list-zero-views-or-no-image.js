#!/usr/bin/env node
// List all posts with zero/missing view count or missing main image

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false })

async function main() {
  const query = `*[_type == "post" && (!defined(mainImage.asset) || !defined(views) || views <= 0)] | order(publishedAt desc){
    _id,
    title,
    slug,
    views,
    mainImage
  }`
  const posts = await client.fetch(query)

  const zeroViews = []
  const noImage = []
  for (const p of posts) {
    const hasImage = !!(p?.mainImage && (p.mainImage.asset || p.mainImage.url))
    const v = typeof p?.views === 'number' ? p.views : 0
    if (!hasImage) noImage.push(p)
    if (v <= 0) zeroViews.push(p)
  }

  function format(list, label) {
    console.log(`\n=== ${label} (${list.length}) ===`)
    for (const p of list) {
      const slug = p?.slug?.current || '(no slug)'
      const v = typeof p?.views === 'number' ? p.views : '—'
      console.log(`- ${p?.title || '(untitled)'} [${slug}] views=${v}`)
    }
  }

  if (!posts.length) {
    console.log('No posts with zero/missing views or missing images found.')
    return
  }

  format(zeroViews, 'Zero or Missing Views')
  format(noImage, 'Missing Main Image')
}

main().catch(err => { console.error(err?.message || err); process.exit(2) })

