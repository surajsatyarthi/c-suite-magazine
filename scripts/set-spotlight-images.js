#!/usr/bin/env node
// Assign spotlight images to CXO Interview articles.
// - Reads public/spotlight.json for slug/image mapping
// - Uploads local PNGs to Sanity and sets post.mainImage
// - Creates a dummy post when missing (minimal content + category)

const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

function cleanEnv(v) {
  return String(v || '')
    .replace(/^"|"$/g, '')
    .replace(/\n$/g, '')
    .trim()
}

const projectId = cleanEnv(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID)
const dataset = cleanEnv(process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production')
const token = cleanEnv(process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN)
const apiVersion = cleanEnv(process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28')

if (!projectId || !dataset || !token) {
  console.error('Missing SANITY env. Require NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and a write token (SANITY_API_TOKEN).')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function decodePublicPath(p) {
  const cleaned = String(p || '').replace(/^\//, '')
  return decodeURIComponent(cleaned)
}

function toTitleCase(str) {
  return String(str || '')
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

async function uploadLocalImage(absPath, filenameHint) {
  const buffer = fs.readFileSync(absPath)
  const asset = await client.assets.upload('image', buffer, {
    filename: filenameHint || path.basename(absPath)
  })
  if (!asset?._id) throw new Error('Asset upload failed')
  return asset
}

async function getCxoCategoryRef() {
  const cat = await client.fetch('*[_type == "category" && slug.current == $slug][0]{ _id, title, slug }', { slug: 'cxo-interview' })
  return cat?._id ? { _type: 'reference', _ref: cat._id } : undefined
}

async function getFallbackAuthorRef() {
// Prefer a writer with slug 'c-suite-magazine' or 'editorial-team'; otherwise first writer
const author = await client.fetch('*[_type == "writer" && slug.current in $slugs][0]{ _id, slug }', { slugs: ['c-suite-magazine', 'editorial-team'] })
if (author?._id) return { _type: 'reference', _ref: author._id }
const any = await client.fetch('*[_type == "writer"] | order(slug.current asc)[0]{ _id, slug }')
  return any?._id ? { _type: 'reference', _ref: any._id } : undefined
}

function makePlaceholderBody(name) {
  const blocks = [
    `Exclusive spotlight on ${name}.`,
    'This is a placeholder article. Full interview will be published shortly.',
    'Stay tuned for leadership insights, innovation perspectives, and executive experiences.'
  ]
  return blocks.map(text => ({
    _type: 'block',
    style: 'normal',
    children: [{ _type: 'span', text }]
  }))
}

async function upsertPostWithImage(slug, imageAbsPath, personName) {
  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, seo }', { slug })
  const asset = await uploadLocalImage(imageAbsPath, `${slug}-hero.png`)
  const alt = `Portrait of ${personName}`.slice(0, 120)

  if (post?._id) {
    console.log(`→ Patching mainImage for ${slug} (existing post)`) 
    await client.patch(post._id)
      .set({
        mainImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt,
        }
      })
      .commit({ autoGenerateArrayKeys: true })
    return { created: false, patched: true, assetId: asset._id }
  }

  console.log(`→ Creating dummy post for ${slug}`)
  const [categoryRef, authorRef] = await Promise.all([getCxoCategoryRef(), getFallbackAuthorRef()])
  const body = makePlaceholderBody(personName)
  const postDoc = {
    _type: 'post',
    title: `${toTitleCase(personName)} — Executive Interview`,
    slug: { _type: 'slug', current: slug },
    excerpt: `Executive spotlight interview with ${toTitleCase(personName)}.`,
  ...(authorRef ? { writer: authorRef } : {}),
    ...(categoryRef ? { categories: [categoryRef] } : {}),
    mainImage: {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt,
    },
    body,
    publishedAt: new Date().toISOString(),
  }
  const created = await client.create(postDoc)
  return { created: true, patched: true, assetId: asset._id, id: created?._id }
}

async function main() {
  const spotlightPath = path.join(__dirname, '..', 'public', 'spotlight.json')
  if (!fs.existsSync(spotlightPath)) {
    console.error('spotlight.json not found under public/')
    process.exit(2)
  }
  const items = JSON.parse(fs.readFileSync(spotlightPath, 'utf-8'))
  if (!Array.isArray(items) || !items.length) {
    console.error('No spotlight entries found.')
    return
  }
  let createdCount = 0
  let updatedCount = 0
  let failedCount = 0

  // Helper: resolve best Featured hero image by slug/name/title
  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  function resolveFeaturedHeroFor({ slug, name, title }) {
    try {
      const dir = path.join(__dirname, '..', 'public', 'Featured hero')
      const files = fs.readdirSync(dir)
      const nSlug = normalize(slug)
      const nName = normalize(name)
      const nTitle = normalize(title)

      const map = files.map((f) => ({
        file: f,
        base: f.replace(/\.(png|jpg|jpeg|webp)$/i, ''),
        norm: normalize(f.replace(/\.(png|jpg|jpeg|webp)$/i, '')),
      }))

      let match = map.find((x) => x.norm === nSlug) || map.find((x) => x.norm === nName)
      if (!match) {
        match =
          map.find((x) => x.norm.includes(nSlug)) ||
          map.find((x) => x.norm.includes(nName)) ||
          map.find((x) => nSlug.includes(x.norm)) ||
          map.find((x) => nName.includes(x.norm)) ||
          map.find((x) => nTitle.includes(x.norm))
      }
      if (!match) return null
      const webpExact = files.find((f) => f.toLowerCase() === `${match.base.toLowerCase()}.webp`)
      const chosen = webpExact || match.file
      return { absPath: path.join(dir, chosen), personName: toTitleCase(match.base) }
    } catch {
      return null
    }
  }

  for (const it of items) {
    try {
      const href = String(it?.href || '')
      const slug = href.replace(/^\/+/, '').split('/').pop()
      if (!slug) {
        console.warn('Skipping entry with invalid href:', href)
        continue
      }
      // Prefer Featured hero image resolution; fallback to spotlight.json image
      const spotlightRel = decodePublicPath(it?.image)
      const hero = resolveFeaturedHeroFor({ slug, name: slug.replace(/-/g, ' '), title: slug })
      let chosenAbs = hero?.absPath
      let personName = hero?.personName
      if (!chosenAbs) {
        chosenAbs = path.join(__dirname, '..', 'public', spotlightRel)
        if (!fs.existsSync(chosenAbs)) {
          console.warn(`Image not found: ${chosenAbs}; skipping ${slug}`)
          continue
        }
        personName = toTitleCase(path.basename(spotlightRel, path.extname(spotlightRel)))
      }
      console.log(`▶ Processing ${personName} [${slug}] ← ${chosenAbs}`)
      const result = await upsertPostWithImage(slug, chosenAbs, personName)
      if (result.created) createdCount++
      if (result.patched) updatedCount++
      // Throttle lightly
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      failedCount++
      console.error('❌ Failed to process entry:', e && e.message ? e.message : e)
    }
  }

  console.log(`\n✅ Completed. Created: ${createdCount}, Updated: ${updatedCount}, Failed: ${failedCount}`)
}

// Ensure global fetch if needed for @sanity/client
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error(e?.message || e); process.exit(1) })
