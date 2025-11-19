#!/usr/bin/env node
// Backfill missing writer profile images via provided APIs
// - Uploads placeholder portraits using /api/images (by URL)
// - Patches writers via /api/writers with returned asset IDs (legacy authors API deprecated)

const { createClient } = require('@sanity/client')
const os = require('os')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const DEV_BASE = process.env.LOCAL_API_BASE || 'http://localhost:3010'

// Sanity read client to discover missing writer images
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function choosePortraitForWriter(author) {
  const slug = author.slug?.current || ''
  const first = (author.name || '').split(' ')[0].toLowerCase()

  // Explicit mapping for known missing authors
  const explicit = {
    'priya-raman': 'https://randomuser.me/api/portraits/women/68.jpg',
    'maya-whitfield': 'https://randomuser.me/api/portraits/women/65.jpg',
    'sofia-alvarez': 'https://randomuser.me/api/portraits/women/43.jpg',
  }
  if (explicit[slug]) return explicit[slug]

  // Basic gender inference by common first names (fallback only)
  const maleNames = new Set(['arjun','carlos','david','martin','michael','raj','andrew','steve','george','ryan'])
  const femaleNames = new Set(['aisha','alicia','elena','emma','linh','maya','priya','sarah','sofia'])

  if (femaleNames.has(first)) {
    // Female placeholder
    return 'https://randomuser.me/api/portraits/women/50.jpg'
  }
  if (maleNames.has(first)) {
    // Male placeholder
    return 'https://randomuser.me/api/portraits/men/50.jpg'
  }
  // Default neutral/female to avoid inserting male for female writers when uncertain
  return 'https://randomuser.me/api/portraits/women/51.jpg'
}

async function uploadImageByUrl(imageUrl, filename, alt) {
  // Download the remote image first, then upload via multipart form-data
  const resImg = await fetch(imageUrl)
  if (!resImg.ok) throw new Error(`Failed to fetch source image: ${resImg.status}`)
  const arrayBuffer = await resImg.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const { Blob } = require('buffer')
  const form = new FormData()
  const mime = 'image/jpeg'
  form.append('file', new Blob([buffer], { type: mime }), filename)
  form.append('alt', alt)
  form.append('filename', filename)
  const res = await fetch(`${DEV_BASE}/api/images`, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Image upload failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  if (!json?.ok || !json?.assetId) {
    throw new Error(`Image API error: ${JSON.stringify(json)}`)
  }
  return json.assetId
}

async function patchWriterImage(slug, assetId) {
  const res = await fetch(`${DEV_BASE}/api/writers`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    duplex: 'half',
    body: JSON.stringify({ slug, imageAssetId: assetId }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Writer update failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  if (!json?.ok) throw new Error(`Writers API error: ${JSON.stringify(json)}`)
  return json
}

async function main() {
  console.log('▶ Fetching writers missing profile images...')
  const authors = await client.fetch('*[_type == "writer" && !defined(image.asset)] | order(name asc){ _id, name, slug }')
  if (!authors?.length) {
    console.log('All writers have images. Nothing to do.')
    return
  }

  console.log(`Found ${authors.length} writer(s) without images.`)
  for (const a of authors) {
    const slug = a.slug?.current
    const name = a.name
    const imageUrl = choosePortraitForWriter(a)
    const filename = `${slug}-profile.jpg`
    const alt = `Profile photo of ${name}`
    try {
      console.log(`→ Uploading image for ${name} (${slug})`) 
      const assetId = await uploadImageByUrl(imageUrl, filename, alt)
      await patchWriterImage(slug, assetId)
      console.log(`✅ Assigned image to ${name} — assetId=${assetId}`)
      // Throttle lightly to avoid any rate limits
      await new Promise(r => setTimeout(r, 200))
    } catch (e) {
      console.error(`❌ Failed to assign image for ${name}:`, (e && e.message) ? e.message : e)
    }
  }
}

main().catch((e) => {
  console.error('Backfill failed:', e)
  process.exit(1)
})
