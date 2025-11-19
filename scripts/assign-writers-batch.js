#!/usr/bin/env node
// Assign editors to all posts from the approved writers list.
// Enforces: editor cannot be the same person as the writer; assigns missing/invalid editors.
// Usage:
//   SANITY_WRITE_TOKEN=<token> node scripts/assign-writers-batch.js [--strategy roundrobin] [--writer priya-raman]

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN

if (!token) {
  console.error('Missing write token: set SANITY_WRITE_TOKEN (or SANITY_API_TOKEN)')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(flag) {
  const idx = process.argv.indexOf(flag)
  return idx > -1 ? process.argv[idx + 1] : undefined
}

function readWritersCsv() {
  const csvPath = path.join(__dirname, '..', 'tmp-writers.csv')
  if (!fs.existsSync(csvPath)) throw new Error('tmp-writers.csv not found')
  const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(Boolean)
  const writers = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((s) => s.trim())
    const name = cols[0]
    const slug = cols[1]
    if (name && slug) writers.push({ name, slug })
  }
  if (!writers.length) throw new Error('No writers found in tmp-writers.csv')
  return writers
}

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function fetchPosts() {
  const query = `*[_type == "post"]{ _id, title, slug, writer-> { _id, name, slug }, editor-> { _id, name, slug } }`
  return await client.fetch(query)
}

async function main() {
  const strategy = getArg('--strategy') || 'roundrobin'
  const specificWriter = getArg('--writer')
  const writers = readWritersCsv()
  const posts = await fetchPosts()

  let assigned = 0
  let skipped = 0
  let idx = 0

  for (const p of posts) {
    const slugCurrent = p?.slug?.current || p?.slug
    const writerSlug = p?.writer?.slug?.current || p?.writer?.slug
    const editorSlug = p?.editor?.slug?.current || p?.editor?.slug

    const needsFix = !editorSlug || editorSlug === writerSlug
    if (!needsFix) { skipped++; continue }

    let writer
    if (specificWriter) {
      writer = writers.find(w => w.slug === specificWriter) || { name: specificWriter.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: specificWriter }
    } else {
      writer = writers[idx % writers.length]
      idx++
    }

    // Enforce: editor cannot equal writer
    if (writer.slug === writerSlug) {
      // pick next writer
      writer = writers[(idx++) % writers.length]
      if (writer.slug === writerSlug) writer = writers[(idx++) % writers.length]
    }

    const editorId = await ensureWriter(writer.name, writer.slug)
    await client.patch(p._id).set({ editor: { _type: 'reference', _ref: editorId } }).commit()
    assigned++
    console.log(`✔ Assigned editor '${writer.name}' to '${p.title}' (/article/${slugCurrent})`)
  }

  console.log(`\nSummary: assigned=${assigned}, skipped=${skipped}, total=${posts.length}`)
}

main().catch((e) => { console.error('Batch assignment failed:', e.message); process.exit(1) })
