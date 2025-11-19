#!/usr/bin/env node
// Import 145 articles from "~/Desktop/articles" into Sanity and replace existing content
// Folder layout:
//  - ~/Desktop/articles/cxo interview/  (50 interviews + 50 images)
//  - ~/Desktop/articles/opinions/       (95 articles + 95 images)
// Each article has JSON (metadata + content), Markdown (formatted), and an image.
// This script pairs JSON/Markdown/Image per article, uploads the image to Sanity,
// and creates Post documents with Portable Text bodies. Views are seeded from JSON
// or defaulted within 1.3M–2.8M.

const fs = require('fs')
const path = require('path')
const os = require('os')
const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)) }

function toSlug(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function baseNameNoExt(file) {
  return path.basename(file, path.extname(file))
}

function normalizeKey(name) {
  return String(name || '')
    // Keep numeric prefixes to maintain uniqueness across files like 001_article.*
    // Do not strip leading digits; only normalize separators and case.
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function safeReadJSON(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')) } catch { return null }
}

function readMarkdownInfo(markdownPath) {
  const raw = fs.readFileSync(markdownPath, 'utf8')
  const lines = raw.split(/\r?\n/)
  // Title: first heading or first non-empty line
  let title = ''
  for (const line of lines) {
    if (!line.trim()) continue
    if (line.trim().startsWith('#')) { title = line.replace(/^#+\s*/, '').trim(); break }
    title = line.trim(); break
  }
  // Excerpt: first paragraph after optional frontmatter separator
  const contentStartIdx = lines.findIndex((l) => l.trim() === '---')
  const start = contentStartIdx >= 0 ? contentStartIdx + 1 : 0
  const bodyText = lines.slice(start).join('\n').trim()
  const paras = bodyText.split(/\n\n+/)
  // Sanitize excerpt: strip markdown images and inline noise
  const sanitizeExcerpt = (s) => String(s || '')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  const excerpt = sanitizeExcerpt((paras[0] || '').replace(/\n/g, ' ').trim()).substring(0, 200)
  return { title, excerpt, bodyText }
}

function markdownToBlocks(text) {
  const lines = String(text || '').split(/\r?\n/)
  const blocks = []
  let paragraphBuffer = []

  // Parse inline **bold** and *italic* into Portable Text marks
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
      if (nextStart === Infinity) {
        pushSpan(remaining)
        break
      }
      if (nextStart > 0) {
        pushSpan(remaining.slice(0, nextStart))
        remaining = remaining.slice(nextStart)
      }
      if (remaining.startsWith('**')) {
        const end = remaining.indexOf('**', 2)
        if (end > 2) {
          pushSpan(remaining.slice(2, end), ['strong'])
          remaining = remaining.slice(end + 2)
        } else {
          pushSpan('**')
          remaining = remaining.slice(2)
        }
        continue
      }
      if (remaining.startsWith('*')) {
        const end = remaining.indexOf('*', 1)
        if (end > 1) {
          pushSpan(remaining.slice(1, end), ['em'])
          remaining = remaining.slice(end + 1)
        } else {
          pushSpan('*')
          remaining = remaining.slice(1)
        }
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
    // Strip inline markdown image lines entirely to avoid exposing raw paths like "images/091_article.jpg"
    if (/^!\[[^\]]*\]\([^\)]*\)$/.test(line.trim())) {
      // Skip inline images; main hero image is handled separately
      continue
    }
    if (/^#{1,4}\s+/.test(line)) {
      flushParagraph()
      const level = (line.match(/^#{1,4}/) || [''])[0].length
      const style = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'
      const text = line.replace(/^#{1,4}\s+/, '')
      blocks.push({ _type: 'block', style, children: parseInlineMarks(text), markDefs: [] })
      continue
    }
    if (/^>\s+/.test(line)) {
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
  // Create category if missing
  const created = await client.create({ _type: 'category', title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), slug: { current: slug } })
  return { _type: 'reference', _ref: created._id }
}

async function getAuthorsRoundRobin() {
  const writers = await client.fetch('*[_type == "writer"] | order(slug.current asc){ _id, slug, name }')
  if (!writers?.length) throw new Error('No writers found in Sanity — add at least one writer in Studio')
  return authors
}

async function uploadImageAsset(filePath, filenameHint) {
  const buffer = fs.readFileSync(filePath)
  const asset = await client.assets.upload('image', buffer, { filename: filenameHint || path.basename(filePath) })
  return asset?._id
}

async function upsertPost(doc) {
  const existing = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, mainImage }', { slug: doc.slug.current })
  if (existing?._id) {
    const patchDoc = { ...doc }
    if (existing.mainImage) delete patchDoc.mainImage
    const res = await client.patch(existing._id).set(patchDoc).commit()
    return { id: res._id, action: 'updated' }
  } else {
    const res = await client.create(doc)
    return { id: res._id, action: 'created' }
  }
}

function estimateReadTimeFromText(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function randomViews() {
  // Updated: 1M–5M range per display convention
  const min = 1_000_000
  const max = 5_000_000
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function collectArticles(folderPath) {
  // Build index: key (basename) -> { json, md, img }
  const index = new Map()
  
  // Check if there's an images/ subfolder
  const imagesDir = path.join(folderPath, 'images')
  const hasImagesDir = fs.existsSync(imagesDir) && fs.statSync(imagesDir).isDirectory()

  // Process main folder for JSON and MD files
  const entries = fs.readdirSync(folderPath, { withFileTypes: true })
  
  for (const entry of entries) {
    if (entry.isDirectory()) continue // Skip directories in main scan
    
    const name = entry.name
    const full = path.join(folderPath, name)
    const ext = path.extname(name).toLowerCase()
    
    if (ext === '.json' || ext === '.md' || ext === '.markdown') {
      const key = normalizeKey(baseNameNoExt(name))
      if (!index.has(key)) index.set(key, {})
      
      if (ext === '.json') index.get(key).json = full
      else if (ext === '.md' || ext === '.markdown') index.get(key).md = full
    }
  }
  
  // Process images/ subfolder if it exists
  if (hasImagesDir) {
    const imageEntries = fs.readdirSync(imagesDir, { withFileTypes: true })
    
    for (const entry of imageEntries) {
      if (entry.isDirectory()) continue
      
      const name = entry.name
      const full = path.join(imagesDir, name)
      const ext = path.extname(name).toLowerCase()
      
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const key = normalizeKey(baseNameNoExt(name))
        if (!index.has(key)) index.set(key, {})
        index.get(key).img = full
      }
    }
  }

  // Return pairs that have at least md or json; image optional
  const items = []
  for (const [key, val] of index.entries()) {
    if (val.json || val.md) items.push({ key, ...val })
  }
  return items
}

async function main() {
  const root = path.join(os.homedir(), 'Desktop', 'articles')
  const folders = [
    { name: 'cxo interview', categorySlug: 'cxo-interview' },
    { name: 'opinions', categorySlug: 'opinion' },
  ]
  for (const f of folders) {
    const dir = path.join(root, f.name)
    if (!fs.existsSync(dir)) throw new Error(`Missing folder: ${dir}`)
  }

  // Prepare authors round-robin
  const authors = await getAuthorsRoundRobin()
  let authorIndex = 0

  let totalCreated = 0
  let totalUpdated = 0

  for (const folder of folders) {
    const dir = path.join(root, folder.name)
    const items = collectArticles(dir)
    console.log(`\nProcessing folder "${folder.name}" (${items.length} items)`) 

    for (const item of items) {
      try {
        // Prefer JSON metadata if available
        const json = item.json ? safeReadJSON(item.json) : null
        let title = json?.title
        let excerpt = json?.excerpt
        let bodyText = json?.content || ''
        let views = typeof json?.viewership_count === 'number' ? json.viewership_count : (typeof json?.views === 'number' ? json.views : undefined)
        let slug = toSlug(title || item.key)
        
        // Determine category from JSON category field
        let categorySlug = folder.categorySlug // Default fallback
        if (json?.category) {
          if (json.category.startsWith('executive-interviews')) {
            categorySlug = 'cxo-interview'
          } else {
            categorySlug = 'opinion'
          }
        }

        if (item.md) {
          const mdInfo = readMarkdownInfo(item.md)
          // Fill missing fields from Markdown
          title = title || mdInfo.title
          excerpt = excerpt || mdInfo.excerpt
          bodyText = bodyText || mdInfo.bodyText
          slug = toSlug(title || item.key)
        }

        if (!title) title = item.key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        if (!excerpt) excerpt = ''
        if (!bodyText) bodyText = ''
        if (!views) views = randomViews()
        
        const catRef = await ensureCategoryRef(categorySlug)

        const readTime = estimateReadTimeFromText(bodyText)
        const bodyBlocks = markdownToBlocks(bodyText)

        // Upload image if present
        let mainImage = undefined
        if (item.img && fs.existsSync(item.img)) {
          const assetId = await uploadImageAsset(item.img, `${slug}-hero${path.extname(item.img)}`)
          mainImage = {
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
            alt: title,
          }
          await sleep(150)
        }

  // Writer round-robin
        const authorRef = { _type: 'reference', _ref: authors[authorIndex % authors.length]._id }
        authorIndex++

        const doc = {
          _type: 'post',
          title,
          slug: { _type: 'slug', current: slug },
          excerpt,
    writer: authorRef,
          categories: catRef ? [catRef] : undefined,
          mainImage,
          isFeatured: false,
          body: bodyBlocks,
          readTime,
          views,
          publishedAt: new Date().toISOString(),
        }

        const result = await upsertPost(doc)
        if (result.action === 'created') totalCreated++
        else totalUpdated++
        console.log(`✔ ${result.action}: ${title} (${folder.name})`)
        await sleep(200)

      } catch (e) {
        console.error(`✖ Failed for ${item.key} (${folder.name}):`, e.message)
      }
    }
  }

  console.log(`\nDone. Created: ${totalCreated}, Updated: ${totalUpdated}.`)
}

// Ensure global fetch available if needed by @sanity/client (Node >= 18 recommended)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Fatal import error:', e)
  process.exit(1)
})
