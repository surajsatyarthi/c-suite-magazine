#!/usr/bin/env node
// Delete specified authors from Sanity and reassign any posts where they are the writer (editor)
// to approved writers from tmp-writers.csv. Also unsets 'author' reference on posts that point
// to the deleted author to avoid dangling refs under the "writers-only" policy.
//
// Usage:
//   SANITY_WRITE_TOKEN=<token> node scripts/delete-authors-and-reassign.js
//
// The list of authors to delete is hardcoded below for safety and auditability.

const fs = require('fs')
const path = require('path')
// Load envs automatically so you don't have to pass the token each time
try {
  const dotenv = require('dotenv')
  // Try .env.local first (Next.js convention), then default .env
  const envLocal = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal })
  } else {
    dotenv.config()
  }
} catch (_) {
  // dotenv is optional; scripts still work if envs are already present
}
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

// Names provided by the user to delete from the authors list
const NAMES_TO_DELETE = Array.from(new Set([
  'Angelina Usanova',
  'Dr. Basma Ghandourah',
  'Bill Faruki',
  'Bryce Tully',
  'Cal Riley',
  'Swami Aniruddha',
  'Supreet Nagi',
  'John Zangardi',
  'Stoyana Natseva',
  "Not Every Executive Aims To Revolutionize Society, But Stoyana Natseva Knew Her Direction Would Be Unique. Subtly Influential, Purposefully Deliberate, And Spiritually Motivated, Her Objective Extends Beyond Guidanceit's To Inspire Enlightenment",
  "Not Every Executive Aims To Revolutionize Society, But Stoyana Natseva Knew Her Direction Would Be Unique. Subtly Influential, Purposefully Deliberate, And Spiritually Motivated, Her Objective Extends Beyond Guidanceit's To Inspire Enlightenment",
  'Rtf1ansiansicpg1252cocoartf2761',
  'Pankaj Bansal',
]))

function parseCSV(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8').trim()
  const lines = raw.split(/\r?\n/)
  const header = lines.shift().split(',')
  return lines.map((line) => {
    const cols = line.split(',')
    const obj = {}
    header.forEach((h, i) => { obj[h] = cols[i] })
    return obj
  })
}

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

function toSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function findAuthorsByName(name) {
  // Exact match by name; also try slug match
  const slug = toSlug(name)
  const results = await client.fetch(
    '*[_type == "author" && (name == $name || slug.current == $slug)]{ _id, name, slug }',
    { name, slug }
  )
  return Array.isArray(results) ? results : []
}

async function getApprovedWritersPool() {
  const csvPath = path.join(process.cwd(), 'tmp-writers.csv')
  if (!fs.existsSync(csvPath)) {
    throw new Error('tmp-writers.csv not found; cannot build approved writers pool')
  }
  const rows = parseCSV(csvPath)
  return rows.map((r) => ({ name: r.name, slug: r.slug }))
}

function makeRoundRobin(pool) {
  let idx = 0
  return () => {
    const next = pool[idx % pool.length]
    idx += 1
    return next
  }
}

async function reassignEditorForAuthor(authorId, pickWriter) {
  const posts = await client.fetch('*[_type == "post" && editor._ref == $aid]{ _id, title, slug }', { aid: authorId })
  const updates = []
  for (const post of posts) {
    const writer = pickWriter()
    const writerId = await ensureWriter(writer.name, writer.slug)
    const res = await client.patch(post._id).set({ editor: { _type: 'reference', _ref: writerId } }).commit()
    updates.push({ post: post.slug?.current || post.slug, from: authorId, to: writer.slug, doc: res._id })
    console.log(`✔ Reassigned writer for '${post.title}' → ${writer.name} (${writer.slug})`)
  }
  return updates
}

async function reassignWriterForAuthor(authorId, pickWriter) {
  const posts = await client.fetch('*[_type == "post" && writer._ref == $aid]{ _id, title, slug }', { aid: authorId })
  const updates = []
  for (const post of posts) {
    const writer = pickWriter()
    const writerId = await ensureWriter(writer.name, writer.slug)
    const res = await client.patch(post._id)
      .set({ writer: { _type: 'reference', _ref: writerId } })
      .unset(['author'])
      .commit()
    updates.push({ post: post.slug?.current || post.slug, from: authorId, to: writer.slug, doc: res._id })
    console.log(`✔ Reassigned writer for '${post.title}' → ${writer.name} (${writer.slug})`)
  }
  return updates
}

async function deleteAuthorDoc(authorId, name) {
  try {
    await client.delete(authorId)
    console.log(`✂ Deleted author '${name}' [${authorId}]`)
    return true
  } catch (e) {
    console.warn(`⚠ Failed deleting '${name}' [${authorId}]: ${e.message}`)
    return false
  }
}

async function main() {
  const pool = await getApprovedWritersPool()
  const pickWriter = makeRoundRobin(pool)

  const summary = { deleted: [], reassignedEditors: [], reassignedAuthors: [], missing: [] }

  for (const name of NAMES_TO_DELETE) {
    const authors = await findAuthorsByName(name)
    if (!authors.length) {
      summary.missing.push(name)
      console.log(`• No author docs found for '${name}'`)
      continue
    }

    for (const a of authors) {
      const reassignedE = await reassignEditorForAuthor(a._id, pickWriter)
      summary.reassignedEditors.push(...reassignedE)

      const reassignedA = await reassignWriterForAuthor(a._id, pickWriter)
      summary.reassignedAuthors.push(...reassignedA)

      const ok = await deleteAuthorDoc(a._id, a.name)
      if (ok) summary.deleted.push({ id: a._id, name: a.name })
    }
  }

  // Report
  console.log('\n==== Summary ====')
  console.log(`Deleted authors: ${summary.deleted.length}`)
  console.log(`Reassigned editors: ${summary.reassignedEditors.length}`)
  console.log(`Reassigned authors: ${summary.reassignedAuthors.length}`)
  console.log(`Not found: ${summary.missing.length}`)
}

main().catch((e) => { console.error('Delete & reassign failed:', e); process.exit(1) })
