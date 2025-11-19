#!/usr/bin/env node
// Auto-assign a writer to any post missing `writer` using the approved list in tmp-writers.csv
// Usage:
//   SANITY_WRITE_TOKEN=<token> node scripts/auto-assign-missing-writers.js [--default priya-raman]

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN

if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN (or SANITY_API_TOKEN).')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(flag) {
  const idx = process.argv.indexOf(flag)
  return idx > -1 ? process.argv[idx + 1] : undefined
}

function readApprovedWritersCsv() {
  const csvPath = path.join(__dirname, '..', 'tmp-writers.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('tmp-writers.csv not found. Place the approved writers list at ceo-magazine/tmp-writers.csv')
    process.exit(1)
  }
  const raw = fs.readFileSync(csvPath, 'utf8').trim()
  const lines = raw.split(/\r?\n/)
  const headers = lines.shift().split(',').map((h) => h.trim())
  const items = lines.map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    const obj = {}
    headers.forEach((h, i) => { obj[h] = cols[i] })
    return obj
  })
  return items
}

async function ensureWriterBySlug(slug, name) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name: name || slug.replace(/-/g, ' '), slug: { current: slug } })
  return created._id
}

async function main() {
  const approved = readApprovedWritersCsv()
  if (approved.length === 0) {
    console.error('Approved writers list is empty in tmp-writers.csv')
    process.exit(1)
  }
  const defaultSlug = getArg('--default') || approved[0].slug
  const defaultName = approved.find((a) => a.slug === defaultSlug)?.name || defaultSlug

  console.log(`Default writer for auto-assignment: ${defaultName} (${defaultSlug})`)

  const posts = await client.fetch('*[_type == "post" && !defined(writer._ref) && defined(slug.current)]{ _id, title, slug }')
  if (!posts?.length) {
    console.log('✔ All posts already have writer assigned. Nothing to do.')
    return
  }

  const writerId = await ensureWriterBySlug(defaultSlug, defaultName)

  let count = 0
  for (const p of posts) {
    try {
      await client.patch(p._id).set({ writer: { _type: 'reference', _ref: writerId } }).commit()
      console.log(`✔ Set writer (${defaultSlug}) for '${p.title}' (/category/<category>/${p.slug?.current || p.slug})`)
      count++
    } catch (e) {
      console.error(`Failed to set writer for '${p.title}': ${e?.message || e}`)
    }
  }

  console.log(`Done. Auto-assigned writer to ${count} post(s).`)
}

main().catch((e) => { console.error('Auto-assign failed:', e?.message || e); process.exit(1) })
