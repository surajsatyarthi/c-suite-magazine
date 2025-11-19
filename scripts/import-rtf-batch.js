#!/usr/bin/env node
// Batch import RTF articles (1–9) into Sanity without uploading RTF files.
// - Converts RTF to Portable Text blocks
// - Derives title/slug from mapping or first paragraph
// - Upserts writer and post documents

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const ARTICLES_DIR = path.resolve(process.env.HOME || '', 'Desktop/Magazine/articles 1-9')

// Known mapping to lock in high-confidence client names
const KNOWN = {
  '1': { name: 'Pankaj Bansal' },
  '2': { name: 'Stoyana Natseva' },
  '3': { name: 'Dr. Basma Ghandourah' },
  '4': { name: 'Bill Faruki' },
  '5': { name: 'John Zangardi' },
  '6': { name: 'Swami Aniruddha' },
  '7': { name: 'Supreet Nagi' },
  '8': { name: 'Cal Riley' },
  '9': { name: 'Bryce Tully' },
}

function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function generateSlugFromTitle(title, idx) {
  const words = String(title || '').split(/\s+/).filter(Boolean)
  const limited = words.slice(0, 8).join(' ')
  let slug = slugify(limited)
  if (slug.length > 60) slug = slug.slice(0, 60).replace(/-+$/,'')
  if (!slug) slug = `article-${idx}`
  return slug
}

function sanitizeExcerpt(s) {
  return String(s || '')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function rtfToParagraphs(rtf) {
  // Convert RTF to plain text lines, aggressively stripping control words and headers
  let txt = String(rtf || '')
    .replace(/\r\n/g, '\n')
    .replace(/\par[d]?/g, '\n')
    .replace(/\line/g, '\n')
    // Drop RTF group braces
    .replace(/[{}]/g, '')
    // Decode hex-escaped bytes (e.g., \'c0)
    .replace(/\'[0-9a-fA-F]{2}/g, (m) => {
      const hex = m.slice(2)
      try { return Buffer.from(hex, 'hex').toString('latin1') } catch { return '' }
    })
    // Remove backslash control sequences like \ansi, \cocoartf, \f0, \cf0, \tx720, etc.
    .replace(/\\[a-zA-Z]+(?:-?\d+)? ?/g, '')
    // Remove remaining backslashes just in case
    .replace(/\\/g, '')

  // Split into lines and trim
  let paras = txt.split(/\n+/).map((p) => p.trim())

  // Filter out common RTF/macOS header noise lines entirely
  const headerNoise = /^(?:rtf\d+|ansi(?:cpg\d+)?|cocoartf\d+|cocoatextscaling\d+|cocoaplatform\d+|fonttbl|colortbl|expandedcolortbl|paperw\d+|paperh\d+|margl\d+|margr\d+|vieww\d+|viewh\d+|viewkind\d+|tx\d+|cf\d+|f\d+|red\d+green\d+blue\d+|irnatural|tightenfactor\d+|pard|lang\d+)$/i
  paras = paras.filter((p) => p && !headerNoise.test(p))

  // Drop leftover font name lines like "Helvetica;" or "Arial" with optional semicolon
  const fontNameLine = /^(?:arial|helvetica|times\s+new\s+roman|courier\s+new|georgia|verdana|palatino|garamond|bookman|avant\s+garde|trebuchet\s+ms|impact|lucida|tahoma|calibri|cambria|consolas)(?:\s*[a-z0-9\-]*)?;?$/i
  // Drop editorial instruction lines like "insert a dummy image in the article"
  const editorialInstruction = /(insert|add|place|put)\b[^\n]*\b(image|photo|picture|graphic)\b/i
  const dummyWord = /\bdummy\b/i
  paras = paras.filter((p) => !fontNameLine.test(p) && !editorialInstruction.test(p) && !dummyWord.test(p))

  // Drop lines that are only punctuation or gibberish remnants
  paras = paras.filter((p) => /[A-Za-z0-9]/.test(p))

  return paras
}

function paragraphsToBlocks(paras) {
  const blocks = []
  for (const p of paras) {
    blocks.push({ _type: 'block', style: 'normal', children: [{ _type: 'span', text: p }], markDefs: [] })
  }
  while (blocks.length < 3) {
    blocks.push({ _type: 'block', style: 'normal', children: [{ _type: 'span', text: '' }], markDefs: [] })
  }
  return blocks
}

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function upsertPost({ title, slug, excerpt, writerId, bodyBlocks }) {
  const interviewRef = await ensureCategoryRef('cxo-interview')
  const doc = {
    _type: 'post',
    title,
    slug: { current: slug },
    excerpt,
    writer: writerId ? { _type: 'reference', _ref: writerId } : undefined,
    body: bodyBlocks,
    categories: interviewRef ? [interviewRef] : undefined,
    isFeatured: false,
  }
  let target = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id }', { slug })
  if (!target?._id) {
    target = await client.fetch('*[_type == "post" && title == $title][0]{ _id }', { title })
  }
  if (target?._id) {
    const res = await client.patch(target._id).set(doc).commit()
    return { id: res._id, action: 'updated' }
  }
  const res = await client.create(doc)
  return { id: res._id, action: 'created' }
}

async function ensureCategoryRef(slug) {
  if (!slug) return undefined
  const cat = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug })
  if (cat?._id) return { _type: 'reference', _ref: cat._id }
  const created = await client.create({ _type: 'category', title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: { current: slug } })
  return { _type: 'reference', _ref: created._id }
}

function getCandidateTitleFromParas(paras, idx) {
  const blacklist = /(rtf|ansicpg|cocoartf|fonttbl|deff|viewkind|pard|f[0-9]+|cf[0-9]+|lang[0-9]+)/i
  for (const p of paras) {
    const raw = p.trim()
    if (!raw) continue
    if (blacklist.test(raw)) continue
    // Must contain letters and at least one space (likely a person’s name)
    if (!/[A-Za-z]/.test(raw)) continue
    if (!/\s/.test(raw)) continue
    const cleaned = raw.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '').trim()
    const words = cleaned.split(/\s+/)
    const titled = words.map(w => w.length ? (w[0].toUpperCase() + w.slice(1).toLowerCase()) : w).join(' ')
    if (titled.length >= 3) return titled
  }
  return `Article ${idx}`
}

async function processFile(file) {
  const basename = path.basename(file, path.extname(file))
  const idx = basename
  const rtfPath = path.join(ARTICLES_DIR, file)
  const raw = fs.readFileSync(rtfPath, 'utf8')
  const paras = rtfToParagraphs(raw)
  const blocks = paragraphsToBlocks(paras)
  const known = KNOWN[idx]
  const title = known?.name || getCandidateTitleFromParas(paras, idx)
  const slug = known?.name ? slugify(known.name) : generateSlugFromTitle(title, idx)
  const excerpt = sanitizeExcerpt((paras[0] || '').slice(0, 200))
  const writerId = await ensureWriter(title, slug)
  const res = await upsertPost({ title, slug, excerpt, writerId, bodyBlocks: blocks })
  console.log(`(${idx}) ${res.action}: /article/${slug} (id: ${res.id})`)
  return { idx, slug, id: res.id }
}

async function main() {
  if (!fs.existsSync(ARTICLES_DIR)) throw new Error(`Directory not found: ${ARTICLES_DIR}`)
  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => /^(?:[1-9])\.rtf$/i.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b))
  if (files.length === 0) {
    console.log('No RTF files (1–9) found to import.')
    return
  }
  const results = []
  for (const f of files) {
    try {
      results.push(await processFile(f))
    } catch (e) {
      console.error(`Failed to import ${f}:`, e.message)
    }
  }
  console.log('Imported:', results.map(r => `/article/${r.slug}`).join(', '))
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Batch import failed:', e)
  process.exit(1)
})
