#!/usr/bin/env node
// Set a Sanity post's mainImage by slug using a remote image URL

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

if (!projectId || !dataset || !token) {
  console.error('Missing SANITY env. Require NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and a write token (SANITY_WRITE_TOKEN/SANITY_API_TOKEN)')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (const a of args) {
    const [k, v] = a.split('=')
    if (k && v) out[k.replace(/^--/, '')] = v
  }
  return out
}

async function uploadImageFromUrl(url, filenameHint = 'main.jpg') {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, { filename: filenameHint })
  return asset
}

async function uploadImageFromFile(filePath, filenameHint = 'main.jpg') {
  const fs = require('fs')
  const path = require('path')
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)
  if (!fs.existsSync(abs)) throw new Error(`Local file not found: ${abs}`)
  const buffer = fs.readFileSync(abs)
  const asset = await client.assets.upload('image', buffer, { filename: filenameHint })
  return asset
}

async function main() {
  const { slug, url, file } = parseArgs()
  if (!slug || (!url && !file)) {
    console.error('Usage: node scripts/set-post-image.js --slug=post-slug --url=https://... | --file=/abs/path/to/image.png')
    process.exit(1)
  }

  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, seo }', { slug })
  if (!post?._id) {
    console.error(`Post not found for slug: ${slug}`)
    process.exit(2)
  }

  console.log(`→ Uploading image for ${slug}`)
  const asset = file
    ? await uploadImageFromFile(file, `${slug}-hero${(file.match(/\.[a-zA-Z0-9]+$/) || ['.jpg'])[0]}`)
    : await uploadImageFromUrl(url, `${slug}-hero.jpg`)
  console.log(`→ Uploaded asset ${asset?._id}`)

  const alt = (post?.seo?.metaTitle || post?.title || slug).slice(0, 120)
  await client.patch(post._id)
    .set({
      mainImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt,
      }
    })
    .commit({ autoGenerateArrayKeys: true })

  console.log(`✅ Set mainImage for ${slug}`)
}

main().catch(err => { console.error(err?.message || err); process.exit(1) })
