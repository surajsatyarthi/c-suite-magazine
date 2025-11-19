#!/usr/bin/env node
// Import 5 available RTF articles from "~/Desktop/Magazine/articles 1-9"
// - Converts RTF to Portable Text blocks
// - Ensures writers and category (cxo-interview)
// - Uploads correct hero image from public/Featured section/<index>.png
// - Deletes prior attempts for the target slugs before upserting

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const ARTICLES_DIR = path.resolve(process.env.HOME || '', 'Desktop/Magazine/articles 1-9')
const FEATURED_IMAGES_DIR = path.resolve(__dirname, '..', 'public', 'Featured section')

// Spotlight index → canonical name; only import the 5 available now
const KNOWN = {
  '1': { name: 'Pankaj Bansal', slug: 'pankaj-bansal' },
  '2': { name: 'Stoyana Natseva', slug: 'stoyana-natseva' },
  '3': { name: 'Dr. Basma Ghandourah', slug: 'dr-basma-ghandourah' },
  '5': { name: 'John Zangardi', slug: 'john-zangardi' },
  '6': { name: 'Swami Aniruddha', slug: 'swami-aniruddha' },
  '7': { name: 'Supreet Nagi', slug: 'supreet-nagi' },
  '9': { name: 'Bryce Tully', slug: 'bryce-tully' },
}
// Support alternate filename spellings
const ALTNAMES = {
  '6': ['swami anirudha'],
  '3': ['dr basma', 'basma ghandourah'],
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
  // Convert and aggressively strip RTF control words and macOS TextEdit headers
  let txt = String(rtf || '')
    .replace(/\r\n/g, '\n')
    .replace(/\pard?/g, '\n')
    .replace(/\line/g, '\n')
    .replace(/[{}]/g, '')
    // decode hex escapes like \'c0
    .replace(/\'[0-9a-fA-F]{2}/g, (m) => {
      const hex = m.slice(2)
      try { return Buffer.from(hex, 'hex').toString('latin1') } catch { return '' }
    })
    // remove control sequences (fonts, colors, layout keys, etc.)
    .replace(/\\[a-zA-Z]+(?:-?\d+)? ?/g, '')
    .replace(/\\/g, '')

  let paras = txt.split(/\n+/).map((p) => p.trim())

  // Filter out common header/control noise lines entirely
  const headerNoise = /^(?:rtf\d+|ansi(?:cpg\d+)?|cocoartf\d+|cocoatextscaling\d+|cocoaplatform\d+|fonttbl|colortbl|expandedcolortbl|paperw\d+|paperh\d+|margl\d+|margr\d+|vieww\d+|viewh\d+|viewkind\d+|tx\d+|cf\d+|f\d+|red\d+green\d+blue\d+|pard|lang\d+|deff\d+)$/i
  const fontNameLine = /^(?:arial|helvetica|times\s+new\s+roman|courier\s+new|georgia|verdana|palatino|garamond|bookman|avant\s+garde|trebuchet\s+ms|impact|lucida|tahoma|calibri|cambria|consolas)(?:\s*[a-z0-9\-]*)?;?$/i
  const editorialInstruction = /(insert|add|place|put)\b[^\n]*\b(image|photo|picture|graphic)\b/i
  const strayControlWords = /^(?:irnatural|tightenfactor\d*)$/i

  paras = paras.filter((p) => p && !headerNoise.test(p) && !fontNameLine.test(p) && !editorialInstruction.test(p) && !strayControlWords.test(p))

  // Drop lines that are only punctuation or gibberish remnants
  paras = paras.filter((p) => /[A-Za-z0-9]/.test(p))

  // Merge soft-wrapped lines: previous ends without punctuation, next starts lowercase
  paras = mergeSoftWraps(paras)

  // Normalize punctuation and combine short fragments
  paras = normalizeParagraphs(paras)

  return paras
}

function mergeSoftWraps(paras) {
  const res = []
  for (const p of paras) {
    if (!res.length) { res.push(p); continue }
    const prev = res[res.length - 1]
    const soft = /[A-Za-z]$/.test(prev) && /^[a-z]/.test(p)
    if (soft) {
      res[res.length - 1] = prev + ' ' + p
    } else {
      res.push(p)
    }
  }
  // Remove tiny fragments left from merges
  return res.filter((p) => p && p.length >= 3)
}

function normalizeParagraphs(paras) {
  const endsSentence = (s) => /[.!?]['””"]?$/.test(String(s).trim())
  const startsLower = (s) => /^[a-z]/.test(String(s).trim())
  const isOnlyPunct = (s) => /^[\.,;:!?—–-]+$/.test(String(s).trim())
  const cleanSpaces = (t) => String(t || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([\(\[“”"'’])\s+/g, '$1')
    .replace(/\s+([’”"'])/g, '$1')
    .replace(/\s+—/g, ' —')
    .trim()

  const out = []
  for (let p of paras) {
    p = cleanSpaces(p)
    if (!p) continue
    if (isOnlyPunct(p) && out.length) {
      // Attach punctuation-only lines to previous paragraph
      out[out.length - 1] = cleanSpaces(out[out.length - 1] + p)
      continue
    }
    if (out.length) {
      const prev = out[out.length - 1]
      const shortFrag = p.length < 40
      const shouldJoin = !endsSentence(prev) && (startsLower(p) || shortFrag)
      if (shouldJoin) {
        out[out.length - 1] = cleanSpaces(prev + ' ' + p)
        continue
      }
    }
    out.push(p)
  }
  return out
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

async function uploadHeroForIndex(idx, filenameHint) {
  const filePath = path.join(FEATURED_IMAGES_DIR, `${idx}.png`)
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  Hero image missing for index ${idx}: ${filePath} — proceeding without mainImage`)
    return undefined
  }
  const buffer = fs.readFileSync(filePath)
  const asset = await client.assets.upload('image', buffer, { filename: filenameHint || `${idx}.png` })
  return asset?._id
}

async function deleteExistingBySlug(slug) {
  const existing = await client.fetch('*[_type == "post" && slug.current == $slug]{ _id }', { slug })
  let count = 0
  for (const p of existing) {
    try { await client.delete(p._id); count++ } catch (e) { console.warn(`Skip delete ${p._id}: ${e.message}`) }
  }
  return count
}

function findRTFForKnown(dir, idx, name) {
  const numeric = path.join(dir, `${idx}.rtf`)
  if (fs.existsSync(numeric)) return numeric
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.rtf'))
  const candidates = [String(name || '')].concat(ALTNAMES[idx] || [])
  const hit = files.find(f => {
    const flat = f.toLowerCase().replace(/\s+/g, '')
    return candidates.some(n => flat.includes(String(n || '').toLowerCase().replace(/\s+/g, '')))
  })
  return hit ? path.join(dir, hit) : null
}


async function upsertPost({ title, slug, excerpt, writerId, bodyBlocks, heroAssetId }) {
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
    mainImage: heroAssetId ? { _type: 'image', asset: { _type: 'reference', _ref: heroAssetId }, alt: title } : undefined,
    // views intentionally not set; marketing controls final values
    publishedAt: new Date().toISOString(),
  }
  let target = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, mainImage }', { slug })
  if (!target?._id) {
    target = await client.fetch('*[_type == "post" && title == $title][0]{ _id, mainImage }', { title })
  }
  if (target?._id) {
    const patchDoc = { ...doc }
    delete patchDoc.editor
    if (target.mainImage) delete patchDoc.mainImage
    const res = await client.patch(target._id).set(patchDoc).commit()
    return { id: res._id, action: 'updated' }
  }
  const res = await client.create(doc)
  return { id: res._id, action: 'created' }
}

async function processOne(idx, info) {
  const { name, slug } = info
  const rtfPath = findRTFForKnown(ARTICLES_DIR, idx, name)
  if (!rtfPath) throw new Error(`RTF not found for ${name} (index ${idx}) in ${ARTICLES_DIR}`)
  const raw = fs.readFileSync(rtfPath, 'utf8')
  const paras = rtfToParagraphs(raw)
  const blocks = paragraphsToBlocks(paras)
  const excerpt = sanitizeExcerpt((paras[0] || '').slice(0, 200))

  // clean slate: delete previous attempts for this slug
  const delCount = await deleteExistingBySlug(slug)
  if (delCount) console.log(`🗑️  Deleted ${delCount} older post(s) for slug: ${slug}`)

  // ensure writer and hero image
  const writerId = await ensureWriter(name, slug)
  const assetId = await uploadHeroForIndex(idx, `${slug}-hero.png`)

  const res = await upsertPost({ title: name, slug, excerpt, writerId, bodyBlocks: blocks, heroAssetId: assetId })
  console.log(`(${idx}) ${res.action}: /article/${slug} (id: ${res.id})`)
  return { idx, slug, id: res.id }
}

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN in environment. Aborting.')
    process.exit(1)
  }
  if (!fs.existsSync(ARTICLES_DIR)) throw new Error(`Directory not found: ${ARTICLES_DIR}`)
  if (!fs.existsSync(FEATURED_IMAGES_DIR)) throw new Error(`Images directory not found: ${FEATURED_IMAGES_DIR}`)

  // Optional: limit to a single target via CLI, e.g. `--only=2` or `--only=stoyana-natseva`
  const onlyArg = (process.argv || []).find(a => a.startsWith('--only='))
  let targets = ['1','2','3','5','6','7']
  if (onlyArg) {
    const val = onlyArg.split('=')[1]
    if (val && KNOWN[val]) {
      targets = [val]
    } else {
      const entry = Object.entries(KNOWN).find(([, info]) => info.slug === val || info.name.toLowerCase() === String(val || '').toLowerCase())
      if (entry) targets = [entry[0]]
    }
    if (!Array.isArray(targets) || targets.length === 0) {
      throw new Error(`--only value not recognized: ${val}`)
    }
  }
  const results = []
  for (const idx of targets) {
    try {
      results.push(await processOne(idx, KNOWN[idx]))
      // small throttle to avoid rate limits
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      console.error(`✖ Failed to import index ${idx}:`, e.message)
    }
  }

  console.log('\nImported:', results.map(r => `/article/${r.slug}`).join(', '))
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Import failed:', e)
  process.exit(1)
})
