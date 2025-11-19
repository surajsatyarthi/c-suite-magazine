#!/usr/bin/env node
// Direct import of a single RTF article into Sanity using a write token.
// Usage: SANITY_WRITE_TOKEN=<token> node scripts/import-single-rtf-direct.js "Angelina Usanova.rtf" [--title "Title"] [--author "Name"] [--category leadership]
// Note: --author maps to writer; schema uses writer exclusively.

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
  let txt = String(rtf || '')
    .replace(/\r\n/g, '\n')
    .replace(/\par[d]?/g, '\n')
    .replace(/\line/g, '\n')
    .replace(/[{}]/g, '')
    .replace(/\'[0-9a-fA-F]{2}/g, (m) => {
      const hex = m.slice(2)
      try { return Buffer.from(hex, 'hex').toString('latin1') } catch { return '' }
    })
    .replace(/\\[a-zA-Z]+(?:-?\d+)? ?/g, '')
    .replace(/\\/g, '')

  let paras = txt.split(/\n+/).map((p) => p.trim())

  const headerNoise = /^(?:rtf\d+|ansi(?:cpg\d+)?|cocoartf\d+|cocoatextscaling\d+|cocoaplatform\d+|fonttbl|colortbl|expandedcolortbl|paperw\d+|paperh\d+|margl\d+|margr\d+|vieww\d+|viewh\d+|viewkind\d+|tx\d+|cf\d+|f\d+|red\d+green\d+blue\d+|irnatural|tightenfactor\d+|pard|lang\d+)$/i
  const fontNameLine = /^(?:arial|helvetica|times\s+new\s+roman|courier\s+new|georgia|verdana|palatino|garamond|bookman|avant\s+garde|trebuchet\s+ms|impact|lucida|tahoma|calibri|cambria|consolas)(?:\s*[a-z0-9\-]*)?;?$/i
  const editorialInstruction = /(insert|add|place|put)\b[^\n]*\b(image|photo|picture|graphic)\b/i

  paras = paras.filter((p) => p && !headerNoise.test(p) && !fontNameLine.test(p) && !editorialInstruction.test(p))
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

async function ensureCategoryRef(slug) {
  if (!slug) return undefined
  const cat = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id }', { slug })
  if (cat?._id) return { _type: 'reference', _ref: cat._id }
  const created = await client.create({ _type: 'category', title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: { current: slug } })
  return { _type: 'reference', _ref: created._id }
}

async function ensureWriter(name, slug) {
  const existing = await client.fetch('*[_type == "writer" && slug.current == $slug][0]{ _id }', { slug })
  if (existing?._id) return existing._id
  const created = await client.create({ _type: 'writer', name, slug: { current: slug } })
  return created._id
}

async function upsertPost({ title, slug, excerpt, writerId, bodyBlocks, categorySlug }) {
  const catRef = await ensureCategoryRef(categorySlug || 'leadership')
  const doc = {
    _type: 'post',
    title,
    slug: { current: slug },
    excerpt,
    writer: writerId ? { _type: 'reference', _ref: writerId } : undefined,
    body: bodyBlocks,
    categories: catRef ? [catRef] : undefined,
    isFeatured: false,
    publishedAt: new Date().toISOString(),
  }
  let target = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id }', { slug })
  if (target?._id) {
    const res = await client.patch(target._id).set(doc).commit()
    return { id: res._id, action: 'updated' }
  }
  const res = await client.create(doc)
  return { id: res._id, action: 'created' }
}

async function main() {
  const argFile = process.argv[2]
  const titleOverrideIdx = process.argv.indexOf('--title')
  const authorOverrideIdx = process.argv.indexOf('--author')
  const categoryIdx = process.argv.indexOf('--category')
  const titleOverride = titleOverrideIdx > -1 ? process.argv[titleOverrideIdx + 1] : undefined
  const authorOverride = authorOverrideIdx > -1 ? process.argv[authorOverrideIdx + 1] : undefined
  const categorySlug = categoryIdx > -1 ? process.argv[categoryIdx + 1] : 'leadership'

  if (!argFile) {
    console.error('Usage: SANITY_WRITE_TOKEN=<token> node scripts/import-single-rtf-direct.js "<filename>.rtf" [--title "Title"] [--author "Name"] [--category leadership]')
    process.exit(1)
  }

  const ARTICLES_DIR = path.resolve(process.env.HOME || '', 'Desktop/Magazine/articles 1-9')
  const rtfPath = path.join(ARTICLES_DIR, argFile)
  if (!fs.existsSync(rtfPath)) throw new Error(`RTF file not found: ${rtfPath}`)

  const raw = fs.readFileSync(rtfPath, 'utf8')
  const paras = rtfToParagraphs(raw)
  if (!paras.length) throw new Error('RTF conversion produced no paragraphs')
  const blocks = paragraphsToBlocks(paras)

  const base = path.basename(argFile, path.extname(argFile))
  const inferredName = base.replace(/\s+/g, ' ').trim()
  const title = titleOverride || inferredName
  const authorName = authorOverride || inferredName
  const slug = slugify(title)
  const writerSlug = slugify(authorName)
  const excerpt = sanitizeExcerpt((paras[0] || '').slice(0, 200))

  const writerId = await ensureWriter(authorName, writerSlug)
  const result = await upsertPost({ title, slug, excerpt, writerId, bodyBlocks: blocks, categorySlug })

  console.log(`Imported: /article/${slug} (${result.action}) id=${result.id}`)
}

main().catch((e) => { console.error('Direct import failed:', e.message); process.exit(1) })
