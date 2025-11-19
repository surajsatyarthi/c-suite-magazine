#!/usr/bin/env node
// Import a single RTF article from "~/Desktop/Magazine/articles 1-9" into Sanity via production APIs.
// Usage: node scripts/import-single-rtf.js "Angelina Usanova.rtf" [--title "Title Override"] [--author "Writer Name"]

const fs = require('fs')
const path = require('path')

const PROD_BASE = process.env.IMPORT_API_BASE || 'https://csuitemagazine.global'

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

async function postJSON(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(`Request failed (${res.status}): ${data.error || res.statusText}`)
  }
  return data
}

async function main() {
  const argFile = process.argv[2]
  const titleOverrideIdx = process.argv.indexOf('--title')
  const authorOverrideIdx = process.argv.indexOf('--author')
  const titleOverride = titleOverrideIdx > -1 ? process.argv[titleOverrideIdx + 1] : undefined
  const authorOverride = authorOverrideIdx > -1 ? process.argv[authorOverrideIdx + 1] : undefined

  if (!argFile) {
console.error('Usage: node scripts/import-single-rtf.js "<filename>.rtf" [--title "Title"] [--author "Name (treated as writer)"]')
    process.exit(1)
  }

  const ARTICLES_DIR = path.resolve(process.env.HOME || '', 'Desktop/Magazine/articles 1-9')
  const rtfPath = path.join(ARTICLES_DIR, argFile)
  if (!fs.existsSync(rtfPath)) {
    throw new Error(`RTF file not found: ${rtfPath}`)
  }

  const raw = fs.readFileSync(rtfPath, 'utf8')
  const paras = rtfToParagraphs(raw)
  if (!paras.length) throw new Error('RTF conversion produced no paragraphs')
  const blocks = paragraphsToBlocks(paras)

// Derive title/writer from filename or overrides
  const base = path.basename(argFile, path.extname(argFile))
  const inferredName = base.replace(/\s+/g, ' ').trim()
  const title = titleOverride || inferredName
  const authorName = authorOverride || inferredName
  const slug = slugify(title)
const writerSlug = slugify(authorName)
  const excerpt = sanitizeExcerpt((paras[0] || '').slice(0, 200))

  // Ensure writer exists (legacy authors API deprecated)
  await postJSON(`${PROD_BASE}/api/writers`, { name: authorName, slug: writerSlug })

  // Upsert article
  const result = await postJSON(`${PROD_BASE}/api/articles`, {
    title,
    slug,
    excerpt,
  writerSlug: writerSlug,
    categorySlugs: ['cxo-interview'],
    body: blocks,
    publishedAt: new Date().toISOString(),
  })

  console.log(`Imported article: ${title} → https://csuitemagazine.global/article/${slug}`)
  console.log(`Result: ${result.action} (id: ${result.id})`)
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Import failed:', e.message)
  process.exit(1)
})
