#!/usr/bin/env node
// Permanently remove duplicate title blocks from all Sanity posts
// - Idempotent: safe to re-run; only removes blocks that exactly match the title
// - Scope: scans all posts (or a single --only=<slug>); removes up to two matching blocks
// - Heuristics: matches heading-like blocks whose text equals the sanitized title
//
// Usage:
//   node scripts/remove-duplicate-title-blocks.js --dry        # report only
//   node scripts/remove-duplicate-title-blocks.js --apply      # perform cleanup
//   node scripts/remove-duplicate-title-blocks.js --only=<slug> --apply

const { createClient } = require('@sanity/client')
const path = require('path')

try {
  require('dotenv').config()
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN (or SANITY_WRITE_TOKEN) in .env.local')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const argv = process.argv.slice(2)
const isApply = argv.includes('--apply')
const onlyArg = argv.find(a => a.startsWith('--only='))
const onlySlug = onlyArg ? onlyArg.split('=')[1] : null
const isDryRun = !isApply

function sanitizeText(raw) {
  return String(raw || '')
    // Markdown image/link/code/formatting
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // RTF artifacts and control words
    .replace(/rtf1[a-z0-9]*/gi, '')
    .replace(/cocoasubrtf[a-z0-9]*/gi, '')
    .replace(/cocoartf[a-z0-9]*/gi, '')
    .replace(/ansicpg\d+/gi, '')
    .replace(/fonttbl|colortbl|stylesheet|applewebdata|macosroman/gi, '')
    .replace(/\\[a-zA-Z]+-?\d*/g, '')
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*[,;:.]{2,}\s*/g, ' ')
    .trim()
}

function roughlyEquals(a, b) {
  const clean = x => sanitizeText(x).toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
  return clean(a) === clean(b)
}

function blocksToText(block) {
  if (!block || !Array.isArray(block.children)) return ''
  return block.children.map(ch => String(ch?.text || '')).join('')
}

function isHeadingStyle(style) {
  const s = String(style || 'normal').toLowerCase()
  return s === 'h1' || s === 'h2' || s === 'h3' || s === 'h4'
}

function shouldRemoveBlock(block, title) {
  if (!block || block._type !== 'block') return false
  const text = blocksToText(block)
  if (!text) return false
  const style = String(block.style || 'normal')
  const cleanedText = sanitizeText(text)
  const cleanedTitle = sanitizeText(title)

  // Exact match
  if (roughlyEquals(cleanedText, cleanedTitle)) {
    const len = cleanedText.length
    return isHeadingStyle(style) || len <= 140
  }

  // Prefix match where remainder is only punctuation/quotes/whitespace
  const tLower = cleanedTitle.toLowerCase()
  const cLower = cleanedText.toLowerCase()
  if (tLower && cLower.startsWith(tLower)) {
    const remainder = cleanedText.slice(cleanedTitle.length)
    const remainderOnlyPunct = /^\s*[,:;.!\-–—"'()\[\]]*\s*$/.test(remainder)
    if (remainderOnlyPunct) {
      return true
    }
  }

  // Fuzzy match: allow minor punctuation/spacing differences or small edit distance
  // Implement Levenshtein distance and consider near-duplicates if:
  // - distance <= max(3, 5% of title length), and
  // - the block length is close to title length (<= title + 15 chars)
  function levenshtein(a, b) {
    const alen = a.length
    const blen = b.length
    if (alen === 0) return blen
    if (blen === 0) return alen
    const dp = Array(blen + 1)
    for (let j = 0; j <= blen; j++) dp[j] = j
    for (let i = 1; i <= alen; i++) {
      let prev = dp[0]
      dp[0] = i
      for (let j = 1; j <= blen; j++) {
        const temp = dp[j]
        dp[j] = Math.min(
          dp[j] + 1,
          dp[j - 1] + 1,
          prev + (a[i - 1] === b[j - 1] ? 0 : 1)
        )
        prev = temp
      }
    }
    return dp[blen]
  }

  const dist = levenshtein(cLower, tLower)
  const threshold = Math.max(3, Math.floor(cleanedTitle.length * 0.05))
  const lengthClose = cleanedText.length <= cleanedTitle.length + 15
  if (lengthClose && dist <= threshold) {
    const len = cleanedText.length
    return isHeadingStyle(style) || len <= 160
  }
  return false
}

async function fetchPosts() {
  if (onlySlug) {
    const p = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, slug, body }', { slug: onlySlug })
    return p && p._id ? [p] : []
  }
  return client.fetch('*[_type == "post"]{ _id, title, slug, body }')
}

async function patchBody(id, body) {
  if (isDryRun) return { _id: id }
  return client.patch(id).set({ body }).commit()
}

async function removeDuplicateTitleBlocks(post) {
  const originalBlocks = Array.isArray(post.body) ? post.body : []
  if (!originalBlocks.length) return { changed: 0, body: originalBlocks }

  let changed = 0
  const keep = []
  let textSeen = 0
  let removedCount = 0

  for (let i = 0; i < originalBlocks.length; i++) {
    const b = originalBlocks[i]
    // Count only text blocks to bound removal to the top section
    const isText = b && b._type === 'block'
    if (isText) textSeen++
    const inTopSection = textSeen <= 5 // consider first ~5 text blocks under hero

    if (inTopSection && shouldRemoveBlock(b, post.title) && removedCount < 2) {
      removedCount++
      changed++
      continue // skip this block
    }
    keep.push(b)
  }
  return { changed, body: keep }
}

async function run() {
  const posts = await fetchPosts()
  if (!posts.length) {
    console.log('No posts found.')
    return
  }
  console.log(`Scanning ${posts.length} post(s) for duplicate title blocks...`)
  let totalRemoved = 0
  let updated = 0

  for (const post of posts) {
    const { changed, body } = await removeDuplicateTitleBlocks(post)
    if (changed > 0) {
      totalRemoved += changed
      const action = isDryRun ? 'Would remove' : 'Removed'
      console.log(`${action} ${changed} duplicate title block(s) -> '${post.title}' (${post.slug?.current || 'no-slug'})`)
      await patchBody(post._id, body)
      if (!isDryRun) updated++
      // Gentle pacing to avoid rate limits
      await new Promise(r => setTimeout(r, 50))
    }
  }

  if (isDryRun) {
    console.log(`Dry-run complete. Would remove ${totalRemoved} block(s) across ${posts.length} post(s).`)
  } else {
    console.log(`Cleanup applied. Removed ${totalRemoved} block(s) across ${updated} updated post(s).`)
  }
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

run().catch((e) => {
  console.error('Failed to remove duplicate title blocks:', e?.message || e)
  process.exit(1)
})
