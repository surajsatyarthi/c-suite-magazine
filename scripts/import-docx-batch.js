#!/usr/bin/env node
// Batch import DOCX (Word) articles into Sanity, preserving headings, lists, bold/italic.
// - Converts DOCX → HTML (mammoth) → Markdown (turndown) → Portable Text blocks
// - Upserts writer and category; sets excerpt from first paragraph
// - Does NOT import inline images from the DOCX; handle hero images separately
//
// Usage examples:
//   pnpm import:docx "~/Desktop/Magazine/word-articles" --category cxo-interview
//   SANITY_API_TOKEN=<token> node scripts/import-docx-batch.js \
//     "/Users/you/Desktop/Magazine/word-articles" --category leadership
//
// Optional flags:
//   --category <slug>       Category slug (default: leadership)
//   --author <name>         Force writer name for all docs (otherwise inferred from filename)
//   --dry                   Dry run (prints planned actions without writing to Sanity)

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')
const mammoth = require('mammoth')
const TurndownService = require('turndown')

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}
if (!token) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(flag) {
  const idx = process.argv.indexOf(flag)
  return idx > -1 ? process.argv[idx + 1] : undefined
}

function toSlug(input) {
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

// Convert Markdown text into Portable Text blocks (headings, lists, blockquotes, bold/italic)
function markdownToBlocks(text) {
  const lines = String(text || '').split(/\r?\n/)
  const blocks = []
  let paragraphBuffer = []

  const parseInlineMarks = (input) => {
    const children = []
    let remaining = String(input || '')
    const pushSpan = (txt, marks = []) => {
      if (!txt) return
      children.push({ _type: 'span', text: txt, marks })
    }
    while (remaining.length) {
      const boldStart = remaining.indexOf('**')
      const italicStart = remaining.indexOf('*')
      const nextStart = Math.min(boldStart >= 0 ? boldStart : Infinity, italicStart >= 0 ? italicStart : Infinity)
      if (nextStart === Infinity) { pushSpan(remaining); break }
      if (nextStart > 0) { pushSpan(remaining.slice(0, nextStart)); remaining = remaining.slice(nextStart) }
      if (remaining.startsWith('**')) {
        const end = remaining.indexOf('**', 2)
        if (end > 2) { pushSpan(remaining.slice(2, end), ['strong']); remaining = remaining.slice(end + 2) }
        else { pushSpan('**'); remaining = remaining.slice(2) }
        continue
      }
      if (remaining.startsWith('*')) {
        const end = remaining.indexOf('*', 1)
        if (end > 1) { pushSpan(remaining.slice(1, end), ['em']); remaining = remaining.slice(end + 1) }
        else { pushSpan('*'); remaining = remaining.slice(1) }
        continue
      }
    }
    return children.length ? children : [{ _type: 'span', text: input || '' }]
  }

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return
    const content = paragraphBuffer.join('\n').trim()
    if (!content.length) { paragraphBuffer = []; return }
    blocks.push({ _type: 'block', style: 'normal', children: parseInlineMarks(content), markDefs: [] })
    paragraphBuffer = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    if (!line.trim()) { flushParagraph(); continue }
    if (/^!\[[^\]]*\]\([^\)]*\)$/.test(line.trim())) { continue }
    if (/^#{1,4}\s+/.test(line)) {
      flushParagraph()
      const level = (line.match(/^#{1,4}/) || [''])[0].length
      const style = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'
      const text = line.replace(/^#{1,4}\s+/, '')
      blocks.push({ _type: 'block', style, children: parseInlineMarks(text), markDefs: [] })
      continue
    }
    if(/^>\s+/.test(line)) {
      flushParagraph()
      const text = line.replace(/^>\s+/, '')
      blocks.push({ _type: 'block', style: 'blockquote', children: parseInlineMarks(text), markDefs: [] })
      continue
    }
    if (/^\-\s+/.test(line)) {
      flushParagraph()
      const text = line.replace(/^\-\s+/, '')
      blocks.push({ _type: 'block', style: 'normal', listItem: 'bullet', children: parseInlineMarks(text), markDefs: [] })
      continue
    }
    paragraphBuffer.push(line)
  }
  flushParagraph()
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
  if (!name) return undefined
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

function extractTitleFromMarkdown(md) {
  const lines = String(md || '').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (/^#\s+/.test(trimmed)) return trimmed.replace(/^#\s+/, '').trim()
    // fallback: first non-empty line
    return trimmed
  }
  return ''
}

function deriveAuthorFromFilename(file) {
  const base = path.basename(file, path.extname(file))
  return base.replace(/[_\-]/g, ' ').replace(/\s+/g, ' ').trim()
}

async function processDocx(filePath, opts) {
  const { categorySlug, authorOverride, dryRun } = opts
  // Convert DOCX → HTML (no images)
  const result = await mammoth.convertToHtml({ path: filePath }, { convertImage: mammoth.images.none })
  const html = result.value || ''
  // HTML → Markdown
  const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' })
  const markdown = turndown.turndown(html)
  // Title
  const title = extractTitleFromMarkdown(markdown) || deriveAuthorFromFilename(filePath)
  const slug = toSlug(title)
  // Excerpt: first paragraph
  const firstPara = String(markdown || '').split(/\n\n+/).find((p) => p && !/^#/.test(p)) || ''
  const excerpt = sanitizeExcerpt(firstPara.replace(/\n/g, ' ').slice(0, 200))
  // Body blocks
  const blocks = markdownToBlocks(markdown)

  // Writer
  const authorName = authorOverride || deriveAuthorFromFilename(filePath)
  const writerSlug = toSlug(authorName)
  const writerId = authorName ? (await ensureWriter(authorName, writerSlug)) : undefined

  if (dryRun) {
    return { dry: true, title, slug, excerpt, categorySlug, writerName: authorName, bodyBlocks: blocks.length }
  }
  const res = await upsertPost({ title, slug, excerpt, writerId, bodyBlocks: blocks, categorySlug })
  return { file: path.basename(filePath), action: res.action, id: res.id, slug }
}

async function main() {
  const folderArg = process.argv[2]
  if (!folderArg) {
    console.error('Usage: node scripts/import-docx-batch.js "+/path/to/folder" [--category cxo-interview] [--author "Name"] [--dry]')
    process.exit(2)
  }
  const categorySlug = getArg('--category') || 'leadership'
  const authorOverride = getArg('--author')
  const dryRun = process.argv.includes('--dry')
  const folderPath = folderArg.replace(/^"|"$/g, '')
  const dir = path.resolve(folderPath)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error('Directory not found:', dir)
    process.exit(3)
  }

  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.docx'))
  if (!files.length) {
    console.error('No .docx files found in:', dir)
    process.exit(4)
  }

  let created = 0, updated = 0
  for (const f of files) {
    try {
      const res = await processDocx(path.join(dir, f), { categorySlug, authorOverride, dryRun })
      if (dryRun) {
        console.log(`DRY: ${f} → title="${res.title}" slug=${toSlug(res.title)} blocks=${res.bodyBlocks}`)
      } else {
        console.log(`${res.action}: /article/${res.slug} (id: ${res.id})`)
        if (res.action === 'created') created++; else if (res.action === 'updated') updated++
      }
      // Be gentle with the API
      await new Promise((r) => setTimeout(r, 100))
    } catch (e) {
      console.error(`Failed for ${f}:`, e.message)
    }
  }

  if (!dryRun) {
    console.log(`Done. Created: ${created}, Updated: ${updated}`)
  } else {
    console.log('Dry-run completed.')
  }
}

// Ensure global fetch for older Node
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('DOCX import failed:', e.message); process.exit(1) })

