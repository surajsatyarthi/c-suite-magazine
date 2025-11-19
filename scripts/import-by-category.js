#!/usr/bin/env node
// CSuite Magazine — Import articles from "Desktop/articles/by_category"
// Matches images by article number against a central images folder.
// Extracts: title, content, csuite_category_name, word_count, viewership_count
  // Creates/updates Sanity post documents with writer, category, image, body blocks.

const fs = require('fs')
const path = require('path')
const os = require('os')
const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

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

function getArticleNumber(filename) {
  // Examples: 001_article.json, 19_article.json
  const match = String(filename).match(/^(\d{1,3})_article\.json$/i)
  return match ? match[1].padStart(3, '0') : null
}

function safeReadJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.warn(`Failed to read JSON: ${filePath} — ${e.message}`)
    return null
  }
}

function parseInlineMarks(text) {
  // Minimal inline mark parsing — bold/italic not needed for cleaned content
  return [{ _type: 'span', text: String(text || ''), marks: [] }]
}

function markdownToBlocks(text) {
  // Parse headings, quotes, and bullets; collapse paragraphs by blank lines
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let paragraphBuffer = []

  function flushParagraph() {
    if (!paragraphBuffer.length) return
    const text = paragraphBuffer.join(' ').trim()
    if (text) blocks.push({ _type: 'block', style: 'normal', children: parseInlineMarks(text), markDefs: [] })
    paragraphBuffer = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) { flushParagraph(); continue }
    // Headings #..####
    const hMatch = line.match(/^#{1,4}\s+/)
    if (hMatch) {
      flushParagraph()
      const level = hMatch[0].trim().length
      const style = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'
      const text = line.replace(/^#{1,4}\s+/, '')
      blocks.push({ _type: 'block', style, children: parseInlineMarks(text), markDefs: [] })
      continue
    }
    // Blockquote
    if (/^>\s+/.test(line)) { flushParagraph(); blocks.push({ _type: 'block', style: 'blockquote', children: parseInlineMarks(line.replace(/^>\s+/, '')), markDefs: [] }); continue }
    // Bullet
    if (/^\-\s+/.test(line)) { flushParagraph(); blocks.push({ _type: 'block', style: 'normal', listItem: 'bullet', children: parseInlineMarks(line.replace(/^\-\s+/, '')), markDefs: [] }); continue }
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
    delete patchDoc.editor
    if (existing.mainImage) delete patchDoc.mainImage
    const res = await client.patch(existing._id).set(patchDoc).commit()
    return { id: res._id, action: 'updated' }
  } else {
    const res = await client.create(doc)
    return { id: res._id, action: 'created' }
  }
}

function slugFromCategoryName(name) {
  // Convert display names to slugs like "Money & Finance" -> "money-finance"
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function sanitizeExcerpt(raw) {
  return String(raw || '')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function estimateReadTime(wordCount, fallbackText) {
  if (typeof wordCount === 'number' && wordCount > 0) {
    return Math.max(1, Math.ceil(wordCount / 200))
  }
  const words = String(fallbackText || '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function chooseImagePath(num, imagesDir) {
  const filename = `${num}.jpg`
  const p = path.join(imagesDir, filename)
  return fs.existsSync(p) ? p : null
}

async function main() {
  const baseArg = process.argv.find(a => a.startsWith('--base='))
  const imagesArg = process.argv.find(a => a.startsWith('--images='))

  const defaultBase = path.join(os.homedir(), 'Desktop', 'articles', 'by_category')
  const defaultImages = path.join(defaultBase, 'images')

  const baseDir = baseArg ? baseArg.split('=')[1] : defaultBase
  const imagesDir = imagesArg ? imagesArg.split('=')[1] : defaultImages

  if (!fs.existsSync(baseDir)) throw new Error(`Folder not found: ${baseDir}`)
  const categories = fs.readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory())

  const authors = await getAuthorsRoundRobin()
  let authorIndex = 0

  let created = 0
  let updated = 0
  let skipped = 0

  for (const cat of categories) {
    const categoryDir = path.join(baseDir, cat.name)
    const jsonFiles = fs.readdirSync(categoryDir).filter(f => /_article\.json$/i.test(f)).sort()
    console.log(`\n▶ Category: ${cat.name} — ${jsonFiles.length} files`)

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(categoryDir, file)
        const json = safeReadJSON(filePath)
        if (!json) { skipped++; continue }

        const title = json.title
        const content = json.content
        const categoryName = json.csuite_category_name || cat.name
        const wc = json.word_count
        const views = json.viewership_count

        const slug = toSlug(title || baseNameNoExt(file))
        const categorySlug = slugFromCategoryName(categoryName)

        const readTime = estimateReadTime(wc, content)
        const bodyBlocks = markdownToBlocks(content)
        const authorRef = { _type: 'reference', _ref: authors[authorIndex % authors.length]._id }
        authorIndex++

        // Match image by article number
        const num = getArticleNumber(file)
        let mainImage = undefined
        let imagePath = null
        if (num) imagePath = chooseImagePath(num, imagesDir)
        if (imagePath && fs.existsSync(imagePath)) {
          const assetId = await uploadImageAsset(imagePath, `${slug}-hero${path.extname(imagePath)}`)
          mainImage = {
            _type: 'image',
            asset: { _type: 'reference', _ref: assetId },
            alt: title || `${categoryName} Feature`
          }
        } else {
          // Fallback to bundled featured image to satisfy required field
          const fallback = path.join(__dirname, '..', 'public', 'featured-issue-1.png')
          if (fs.existsSync(fallback)) {
            const assetId = await uploadImageAsset(fallback, `${slug}-hero.png`)
            mainImage = { _type: 'image', asset: { _type: 'reference', _ref: assetId }, alt: title || 'Featured' }
          }
        }

        const catRef = await ensureCategoryRef(categorySlug)

        const doc = {
          _type: 'post',
          title: title || baseNameNoExt(file),
          slug: { _type: 'slug', current: slug },
          excerpt: sanitizeExcerpt(content).substring(0, 200),
    writer: authorRef,
          categories: catRef ? [catRef] : undefined,
          mainImage,
          isFeatured: false,
          body: bodyBlocks,
          readTime,
          views: typeof views === 'number' ? views : undefined,
          wordCount: typeof wc === 'number' ? wc : undefined,
          publishedAt: new Date().toISOString(),
        }

        const res = await upsertPost(doc)
        if (res.action === 'created') created++
        else updated++
        console.log(`✔ ${res.action}: ${title || baseNameNoExt(file)} (${cat.name})`)
        await new Promise(r => setTimeout(r, 150))
      } catch (e) {
        console.error(`✖ Failed for ${file} (${cat.name}): ${e.message}`)
        skipped++
      }
    }
  }

  console.log(`\nDone. Created: ${created}, Updated: ${updated}, Skipped: ${skipped}.`)
}

// Ensure global fetch if needed (Node >= 18 recommended)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Fatal import error:', e)
  process.exit(1)
})
