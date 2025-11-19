#!/usr/bin/env node
// Generate meaningful SEO title suggestions from article content
// Usage:
//   node scripts/generate-seo-titles.js [--apply]
// - Without flags: prints suggested titles per post
// - With --apply: sets seo.metaTitle when missing

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
const APPLY = process.argv.includes('--apply')

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// Simple sanitizer: strips markdown and common RTF artifacts
function sanitize(text) {
  return String(text || '')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\brtf1(?:ansiansi|ansi)?cpg\d+.*?(?=\s|$)/gi, '')
    .replace(/cocoartf\d+/gi, '')
    .replace(/\b(?:macosx|cocoartf|cocoatext|cocoa)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const STOPWORDS = new Set([
  'the','and','for','with','that','this','from','into','over','under','about','across','after','before','by','on','in','at','to','of','a','an','as','is','are','was','were','be','being','been','it','its','their','his','her','our','your','yours','them','they','we','you','i'
])

function extractKeywords(text, max = 8) {
  const cleaned = sanitize(text).toLowerCase()
  const words = cleaned.split(/[^a-z0-9'+-]+/).filter(w => w && w.length >= 4 && !STOPWORDS.has(w))
  const freq = new Map()
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1)
  const sorted = Array.from(freq.entries()).sort((a,b) => b[1] - a[1]).map(([w]) => w)
  return sorted.slice(0, max)
}

function extractNgrams(text) {
  const tokens = sanitize(text).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const bigrams = new Map()
  const trigrams = new Map()
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i], b = tokens[i+1]
    if (STOPWORDS.has(a) || STOPWORDS.has(b)) continue
    const bi = `${a} ${b}`
    bigrams.set(bi, (bigrams.get(bi) || 0) + 1)
    if (i < tokens.length - 2) {
      const c = tokens[i+2]
      if (STOPWORDS.has(c)) continue
      const tri = `${a} ${b} ${c}`
      trigrams.set(tri, (trigrams.get(tri) || 0) + 1)
    }
  }
  const topBigrams = Array.from(bigrams.entries()).sort((a,b) => b[1]-a[1]).map(([p]) => p)
  const topTrigrams = Array.from(trigrams.entries()).sort((a,b)=>b[1]-a[1]).map(([p]) => p)
  return { bigrams: topBigrams.slice(0, 6), trigrams: topTrigrams.slice(0, 6) }
}

function extractForPhrase(text) {
  const m = sanitize(text).toLowerCase().match(/\bfor\s+(a|the)\s+([a-z]+)\s+([a-z]+)/)
  if (!m) return ''
  const phrase = `for ${m[1]} ${m[2]} ${m[3]}`
  return capitalizePhrase(phrase)
}

function extractGerundPhrase(text, keywords) {
  const cleaned = sanitize(text)
  const m = cleaned.match(/\b([A-Za-z]+ing)\s+([A-Za-z]+)(?:\s+([A-Za-z]+))?/)
  if (!m) return ''
  const w2 = m[2]?.toLowerCase(), w3 = (m[3]||'').toLowerCase()
  const isKey = (w) => w && keywords.includes(w) && !STOPWORDS.has(w)
  if (isKey(w2) || isKey(w3)) {
    return capitalizePhrase([m[1], m[2], m[3]].filter(Boolean).join(' '))
  }
  return ''
}

function capitalizePhrase(p) {
  return String(p || '')
    .split(/\s+/)
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ')
}

function extractCompanyFromPosition(position) {
  const p = String(position || '')
  const atMatch = p.match(/\bat\s+([^,]+)$/i)
  if (atMatch) return atMatch[1].trim()
  const commaParts = p.split(',').map(s => s.trim()).filter(Boolean)
  if (commaParts.length >= 2) return commaParts[commaParts.length - 1]
  return ''
}

function generateCandidates({ authorName, authorPosition, company, keywords }) {
  // Deprecated: we no longer include writer/author details in titles
  // Kept for reference; not used.
  const top = keywords[0] || 'Leadership'
  const second = keywords[1] || 'Strategy'
  const safeName = authorName || 'CXO'
  const safeCompany = company || ''
  const candidates = [
    `${safeName} on ${capitalize(top)}`,
    safeCompany ? `${safeName} — ${capitalize(second)} at ${safeCompany}` : `${safeName} — ${capitalize(second)}`,
    `${safeName}: ${capitalize(top)} and ${capitalize(second)}`
  ]
  return candidates.map(c => c.replace(/\s+/g, ' ').trim())
}

function capitalize(s) { return (s || '').charAt(0).toUpperCase() + (s || '').slice(1) }

function scoreTitle(t) {
  const len = t.length
  const words = t.split(/\s+/).length
  let score = 0
  // Length target: 40–60 chars
  if (len >= 40 && len <= 60) score += 3
  else if (len >= 28 && len <= 70) score += 2
  // Word count target: 6–10
  if (words >= 6 && words <= 10) score += 3
  else if (words >= 4 && words <= 12) score += 2
  // Penalize odd punctuation
  if (!/[!?\-—:,]$/.test(t)) score += 1
  // Prefer titles starting with name
  if (/^[A-Z][a-z]+/.test(t)) score += 1
  return score
}

function pickBest(candidates) {
  return candidates
    .map(c => sanitize(c))
    .filter(c => c && c.length >= 24)
    .sort((a, b) => scoreTitle(b) - scoreTitle(a))[0]
}

async function main() {
  const posts = await client.fetch(`*[_type == "post"]{ _id, title, slug, excerpt, seo, "excerptText": coalesce(pt::text(excerpt), pt::text(body)), "bodyText": pt::text(body) }`)
  const results = []
  for (const p of posts) {
    const title = String(p.title || '').trim()
    // Target short headings like name-only titles
    const isShort = title && title.split(/\s+/).length <= 3 && title.replace(/\s+/g, '').length <= 24
    if (!isShort) continue

    const subjectName = title
    const baseText = sanitize(`${p.excerptText || ''} ${p.bodyText || ''}`)
    const keywords = extractKeywords(baseText)
    const { bigrams, trigrams } = extractNgrams(baseText)
    const forPhrase = extractForPhrase(baseText)
    const gerund = extractGerundPhrase(baseText, keywords)
    const candidates = generateCandidatesStructured({ name: subjectName, keywords, bigrams, trigrams, forPhrase, gerund })
    const best = pickBest(candidates) || title

    results.push({ id: p._id, slug: p?.slug?.current || '', currentTitle: title, suggested: best })
  }

  if (!results.length) {
    console.log('No short-heading posts found for suggestion.')
    return
  }

  console.log('Suggested SEO titles for short-heading articles:')
  for (const r of results) {
    console.log(`- ${r.slug}: "${r.suggested}" (current: "${r.currentTitle}")`)
  }

  if (APPLY) {
    if (!token) {
      console.error('Cannot apply: missing SANITY write token (SANITY_API_TOKEN).')
      process.exit(2)
    }
    let applied = 0
    for (const r of results) {
      try {
        await client.patch(r.id).set({ seo: { metaTitle: r.suggested } }).commit()
        console.log(`✔ Set seo.metaTitle for ${r.slug}`)
        applied++
        await new Promise((res) => setTimeout(res, 100))
      } catch (e) {
        console.error(`Failed to set metaTitle for ${r.slug}:`, e.message)
      }
    }
    console.log(`Done. Applied ${applied}/${results.length} metaTitle updates.`)
  }
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Failed to generate titles:', e)
  process.exit(1)
})
function generateCandidatesNoAuthor({ subjectName, keywords }) {
  const top = keywords[0] || 'Leadership'
  const second = keywords[1] || 'Strategy'
  const name = subjectName || 'CXO'
  const candidates = [
    `${name} on ${capitalize(top)}`,
    `${name}: ${capitalize(top)} and ${capitalize(second)}`,
    `${capitalize(top)} with ${name}`,
    `${name} on ${capitalize(top)} Strategy`
  ]
  return candidates.map(c => c.replace(/\s+/g, ' ').trim())
}

function generateCandidatesStructured({ name, keywords, bigrams, trigrams, forPhrase, gerund }) {
  const topBi = bigrams[0] ? capitalizePhrase(bigrams[0]) : ''
  const secondBi = bigrams[1] ? capitalizePhrase(bigrams[1]) : ''
  const topTri = trigrams[0] ? capitalizePhrase(trigrams[0]) : ''
  const k1 = keywords[0] ? capitalize(keywords[0]) : 'Leadership'
  const k2 = keywords[1] ? capitalize(keywords[1]) : 'Strategy'
  const parts = []
  if (gerund && topBi) parts.push(`${name}: ${gerund} ${topBi}`)
  if (topBi && forPhrase) parts.push(`${name}: ${topBi} ${forPhrase}`)
  if (topTri) parts.push(`${name}: ${topTri}`)
  if (topBi && secondBi) parts.push(`${name}: ${topBi} and ${secondBi}`)
  parts.push(`${name} on ${k1}`)
  parts.push(`${name}: ${k1} and ${k2}`)
  return Array.from(new Set(parts.map(p => p.replace(/\s+/g,' ').trim()))).filter(Boolean)
}
