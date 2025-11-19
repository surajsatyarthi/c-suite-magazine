#!/usr/bin/env node
// Scan Sanity posts and list any with broken or missing main images

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

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return res
  } catch (e) {
    return { ok: false, status: 0, headers: new Map(), error: e }
  }
}

async function main() {
  const posts = await client.fetch(`*[_type == "post"]{ _id, title, slug, mainImage, "imageUrl": mainImage.asset->url }`)

  const broken = []

  for (const p of posts) {
    const slug = p?.slug?.current || '(no slug)'
    if (!p.mainImage) {
      broken.push({ slug, title: p.title, reason: 'no_mainImage' })
      continue
    }
    if (!p.imageUrl) {
      broken.push({ slug, title: p.title, reason: 'no_asset_url' })
      continue
    }
    const res = await head(p.imageUrl)
    const ct = res?.headers?.get ? (res.headers.get('content-type') || '') : ''
    if (!res.ok) {
      broken.push({ slug, title: p.title, reason: `http_${res.status}` })
      continue
    }
    if (ct && !ct.startsWith('image/')) {
      broken.push({ slug, title: p.title, reason: `not_image (${ct})` })
      continue
    }
  }

  if (!broken.length) {
    console.log('No broken images found.')
    return
  }
  console.log('Broken images:')
  for (const b of broken) {
    console.log(`- ${b.slug} :: ${b.title} => ${b.reason}`)
  }
}

main().catch(err => { console.error(err?.message || err); process.exit(2) })

