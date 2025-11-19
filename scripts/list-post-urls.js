#!/usr/bin/env node
// List all Sanity post slugs and write local URLs to a file

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY project/dataset env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false })

async function main() {
  const posts = await client.fetch('*[_type == "post"] | order(slug.current asc){ title, slug }')
  const urls = posts
    .map(p => p?.slug?.current)
    .filter(Boolean)
    .map(slug => `http://localhost:3000/article/${slug}`)

  const outPath = path.join(__dirname, '../tmp-post-urls.txt')
  fs.writeFileSync(outPath, urls.join('\n'))
  console.log(outPath)
}

main().catch(err => { console.error(err.message); process.exit(2) })

