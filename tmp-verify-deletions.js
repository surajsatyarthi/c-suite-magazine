#!/usr/bin/env node
// Verify that specified authors have no remaining references as author or editor
// and optionally confirm whether their author documents still exist.

const fs = require('fs')
const path = require('path')

try {
  const dotenv = require('dotenv')
  const envLocal = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envLocal)) {
    dotenv.config({ path: envLocal })
  } else {
    dotenv.config()
  }
} catch (_) {}

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

const NAMES = [
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
  'Rtf1ansiansicpg1252cocoartf2761',
  'Pankaj Bansal',
]

function toSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function findAuthorsByName(name) {
  const slug = toSlug(name)
  const results = await client.fetch(
    '*[_type == "author" && (name == $name || slug.current == $slug)]{ _id, name, slug }',
    { name, slug }
  )
  return Array.isArray(results) ? results : []
}

async function countRefs(aid) {
  const authored = await client.fetch('count(*[_type == "post" && author._ref == $aid])', { aid })
  const edited = await client.fetch('count(*[_type == "post" && editor._ref == $aid])', { aid })
  return { authored, edited }
}

async function main() {
  let totalAuthored = 0
  let totalEdited = 0
  let foundDocs = 0
  let missingDocs = 0

  for (const name of NAMES) {
    const authors = await findAuthorsByName(name)
    if (!authors.length) {
      missingDocs += 1
      console.log(`• No author docs for '${name}'`)
      continue
    }
    foundDocs += authors.length
    for (const a of authors) {
      const { authored, edited } = await countRefs(a._id)
      totalAuthored += authored
      totalEdited += edited
      console.log(`'${name}' [${a._id}] → authored: ${authored}, edited: ${edited}`)
    }
  }

  console.log('\n==== Verification Summary ====')
  console.log(`Author docs found: ${foundDocs}`)
  console.log(`Author docs missing: ${missingDocs}`)
  console.log(`Total authored refs: ${totalAuthored}`)
  console.log(`Total editor refs: ${totalEdited}`)
}

main().catch((e) => { console.error('Verification failed:', e); process.exit(1) })

