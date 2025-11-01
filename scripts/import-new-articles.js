#!/usr/bin/env node
// Batch import script: reads "~/Desktop/new articles" and creates posts in Sanity
// - Uploads images via production Images API (multipart)
// - Creates/updates articles via production Articles API

const fs = require('fs')
const path = require('path')
const os = require('os')
const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const PROD_BASE = process.env.IMPORT_API_BASE || 'https://csuitemagazine.global'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

function toSlug(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function readMarkdownInfo(markdownPath) {
  const raw = fs.readFileSync(markdownPath, 'utf8')
  const lines = raw.split(/\r?\n/)
  // Heuristics: title may be first non-empty line or an explicit **Category** line exists
  let title = ''
  for (const line of lines) {
    if (line.trim().length === 0) continue
    if (line.trim().startsWith('#')) {
      title = line.replace(/^#+\s*/, '').trim()
      break
    }
    // If not heading, use first non-empty as title
    title = line.trim()
    break
  }

  // Extract category from a line like "**Category:** business/innovation-technology"
  const catLine = lines.find((l) => l.toLowerCase().includes('**category:**'))
  let category = undefined
  if (catLine) {
    const m = catLine.match(/\*\*Category:\*\*\s*(.+)/i)
    if (m) category = m[1].trim()
  }

  // Excerpt: first paragraph after separator or first non-empty block of text
  let excerpt = ''
  const contentStartIdx = lines.findIndex((l) => l.trim() === '---')
  const start = contentStartIdx >= 0 ? contentStartIdx + 1 : 0
  const bodyText = lines.slice(start).join('\n').trim()
  const paras = bodyText.split(/\n\n+/)
  excerpt = (paras[0] || '').replace(/\n/g, ' ').trim()

  return { title, category, excerpt, bodyText }
}

function guessImageForMarkdown(imagesDir, markdownFilename) {
  // Match by numeric prefix before first underscore, e.g., "08_..." -> prefix "08"
  const prefixMatch = markdownFilename.match(/^(\d{2})_/)
  const prefix = prefixMatch ? prefixMatch[1] : null
  const files = fs.readdirSync(imagesDir)
  if (prefix) {
    const hit = files.find((f) => f.startsWith(prefix + '_'))
    if (hit) return path.join(imagesDir, hit)
  }
  // Fallback: try same base name but different extension
  const base = path.basename(markdownFilename, path.extname(markdownFilename))
  const hit = files.find((f) => f.startsWith(base))
  return hit ? path.join(imagesDir, hit) : null
}

async function uploadImage(filePath) {
  const { Blob } = require('buffer')
  const buffer = fs.readFileSync(filePath)
  const filename = path.basename(filePath)
  const ext = path.extname(filename).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg'
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mime }), filename)
  form.append('alt', filename)
  form.append('filename', filename)
  const res = await fetch(`${PROD_BASE}/api/images`, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Image upload failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  if (!json?.ok) throw new Error(`Image upload API error: ${JSON.stringify(json)}`)
  return json.assetId
}

async function upsertArticle({ title, slug, excerpt, bodyText, category, mainImageAssetId }) {
  function markdownToBlocks(text) {
    const lines = String(text || '').split(/\r?\n/)
    const blocks = []
    let paragraphBuffer = []

    const flushParagraph = () => {
      if (paragraphBuffer.length === 0) return
      const content = paragraphBuffer.join('\n').trim()
      if (content.length === 0) { paragraphBuffer = []; return }
      blocks.push({
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: content }],
        markDefs: [],
      })
      paragraphBuffer = []
    }

    for (const rawLine of lines) {
      const line = rawLine.trimEnd()
      if (line.trim().length === 0) {
        flushParagraph()
        continue
      }
      // Headings
      if (/^#{1,4}\s+/.test(line)) {
        flushParagraph()
        const level = (line.match(/^#{1,4}/) || [''])[0].length
        const style = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'
        const text = line.replace(/^#{1,4}\s+/, '')
        blocks.push({ _type: 'block', style, children: [{ _type: 'span', text }], markDefs: [] })
        continue
      }
      // Blockquote
      if (/^>\s+/.test(line)) {
        flushParagraph()
        const text = line.replace(/^>\s+/, '')
        blocks.push({ _type: 'block', style: 'blockquote', children: [{ _type: 'span', text }], markDefs: [] })
        continue
      }
      // Bullet
      if (/^-\s+/.test(line)) {
        flushParagraph()
        const text = line.replace(/^-\s+/, '')
        blocks.push({ _type: 'block', style: 'normal', listItem: 'bullet', children: [{ _type: 'span', text }], markDefs: [] })
        continue
      }
      // Accumulate paragraph text
      paragraphBuffer.push(line)
    }
    flushParagraph()
    return blocks
  }

  const bodyBlocks = markdownToBlocks(bodyText)
  const payload = {
    title,
    slug,
    excerpt,
    // Assign editors equally by slug (round-robin, computed in main())
    authorSlug: upsertArticle.__authorSlug,
    mainImageAssetId,
    mainImageAlt: title,
    isFeatured: false,
    // Send Portable Text blocks for proper rendering on article pages
    body: bodyBlocks,
    // Map category to slug(s): use last segment when formatted like "business/innovation-technology"
    categorySlugs: category ? [String(category).split('/').pop()] : undefined,
  }
  const res = await fetch(`${PROD_BASE}/api/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Article upsert failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  if (!json?.ok) throw new Error(`Article API error: ${JSON.stringify(json)}`)
  return json
}

async function main() {
  const desktopRoot = path.join(os.homedir(), 'Desktop', 'new articles')
  const imagesDir = path.join(desktopRoot, 'images')
  const mdDir = path.join(desktopRoot, 'markdown')
  if (!fs.existsSync(desktopRoot)) throw new Error(`Folder not found: ${desktopRoot}`)
  const mdFiles = fs
    .readdirSync(mdDir)
    .filter((f) => f.endsWith('.md'))
    .sort()

  const limitArg = process.argv.find((a) => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : mdFiles.length

  console.log(`Importing up to ${limit} articles from: ${mdDir}`)
  // Load authors sorted by slug for stable order
  const authors = await client.fetch('*[_type == "author"] | order(slug.current asc){ _id, slug }')
  if (!authors?.length) throw new Error('No authors found in Sanity for author assignment')
  let authorIndex = 0
  let count = 0
  for (const md of mdFiles) {
    if (count >= limit) break
    try {
      const mdPath = path.join(mdDir, md)
      const info = readMarkdownInfo(mdPath)
      const title = info.title || path.basename(md, path.extname(md)).replace(/^\d+_/, '').replace(/_/g, ' ')
      const slug = toSlug(title)
      const imagePath = guessImageForMarkdown(imagesDir, md)
      let assetId = undefined
      if (imagePath && fs.existsSync(imagePath)) {
        assetId = await uploadImage(imagePath)
        // Throttle to avoid rate limits
        await sleep(300)
      } else {
        console.warn(`No image matched for ${md}`)
      }
      // Set author slug per article before sending (round-robin)
      upsertArticle.__authorSlug = authors[authorIndex % authors.length]?.slug?.current
      const result = await upsertArticle({
        title,
        slug,
        excerpt: info.excerpt,
        bodyText: info.bodyText,
        category: info.category,
        mainImageAssetId: assetId,
      })
      authorIndex++
      console.log(`✔ ${result.action}: ${title} (id: ${result.id})`)
      count++
      await sleep(200)
    } catch (e) {
      console.error(`✖ Failed for ${md}:`, e.message)
    }
  }
  console.log(`Done. Imported ${count} article(s).`)
}

// Ensure global fetch/FormData available (Node >= 18)
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

if (typeof FormData === 'undefined') {
  const FormDataMod = require('form-data')
  global.FormData = FormDataMod
}

main().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
})
