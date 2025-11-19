#!/usr/bin/env node
// Audit tags across Sanity posts and produce a summary + CSV report.
// - Lists total posts, posts missing tags, and tag frequency (case-insensitive)
// - Writes CSV: tmp-post-tag-report.csv with slug,title,tags_count,tags,primary_category

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
// Prefer explicit API token if present; fall back to read/write tokens
const token =
  process.env.SANITY_API_TOKEN ||
  process.env.SANITY_READ_TOKEN ||
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_TOKEN ||
  undefined
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_DATASET env vars.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function normTag(t) {
  return String(t || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

async function main() {
  const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc){
    title,
    slug,
    tags,
    "categories": categories[]->{ title, slug }
  }`)

  const total = posts.length
  const missingTags = []
  const tagFreq = new Map()

  for (const p of posts) {
    const tags = Array.isArray(p?.tags) ? p.tags.filter(Boolean) : []
    if (!tags.length) {
      missingTags.push(p)
    }
    for (const raw of tags) {
      const t = normTag(raw)
      if (!t) continue
      tagFreq.set(t, (tagFreq.get(t) || 0) + 1)
    }
  }

  const topTags = Array.from(tagFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)

  // Write CSV report
  const outPath = path.join(__dirname, '..', 'tmp-post-tag-report.csv')
  const rows = []
  rows.push(['slug', 'title', 'tags_count', 'tags', 'primary_category'].join(','))
  for (const p of posts) {
    const slug = p?.slug?.current || ''
    const title = String(p?.title || '').replace(/"/g, '""')
    const tagsArr = Array.isArray(p?.tags) ? p.tags.filter(Boolean) : []
    const tagsStr = tagsArr.join('|').replace(/"/g, '""')
    const primaryCat = p?.categories?.[0]?.title || ''
    rows.push([slug, `"${title}"`, tagsArr.length, `"${tagsStr}"`, `"${primaryCat}"`].join(','))
  }
  fs.writeFileSync(outPath, rows.join('\n'))

  // Console summary
  console.log('Tag Audit Summary')
  console.log(`- Total posts: ${total}`)
  console.log(`- Posts missing tags: ${missingTags.length}`)
  console.log('- Top normalized tags (top 10):')
  for (const [t, c] of topTags.slice(0, 10)) {
    console.log(`  - ${t} | count≈${c}`)
  }

  const dupCaseGroups = new Map()
  for (const p of posts) {
    const tagsArr = Array.isArray(p?.tags) ? p.tags.filter(Boolean) : []
    const lowerSet = new Set(tagsArr.map(normTag))
    if (lowerSet.size < tagsArr.length) {
      const slug = p?.slug?.current || 'no-slug'
      dupCaseGroups.set(slug, tagsArr)
    }
  }
  if (dupCaseGroups.size) {
    console.log('- Case-insensitive duplicates: present')
  } else {
    console.log('- Case-insensitive duplicates: none')
  }

  console.log(`\nCSV written: ${outPath}`)
}

main().catch((err) => {
  console.error('Tag audit failed:', err && err.message ? err.message : err)
  process.exit(2)
})
