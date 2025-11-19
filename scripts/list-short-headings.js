#!/usr/bin/env node
// List articles with short headings (similar to "Stoyana Natseva")
// Heuristic: titles with <= 3 words and <= 24 non-space characters

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function wordCount(title) {
  const cleaned = String(title || '').replace(/[^A-Za-z0-9\s'-]/g, ' ').trim()
  if (!cleaned) return 0
  return cleaned.split(/\s+/).filter(Boolean).length
}

function charCountNoSpace(title) {
  const cleaned = String(title || '').replace(/\s+/g, '')
  return cleaned.length
}

function isShortTitle(title) {
  return wordCount(title) <= 3 && charCountNoSpace(title) <= 24
}

async function main() {
  const posts = await client.fetch('*[_type == "post"]{ _id, title, slug }')
  const shorties = posts
    .map(p => ({
      id: p._id,
      title: String(p.title || '').trim(),
      slug: p.slug?.current || '',
      words: wordCount(p.title),
      charsNoSpace: charCountNoSpace(p.title),
    }))
    .filter(p => isShortTitle(p.title))
    .sort((a, b) => a.words - b.words || a.charsNoSpace - b.charsNoSpace)

  if (!shorties.length) {
    console.log('No short-title articles found with current heuristic (<=3 words, <=24 chars).')
    return
  }

  console.log('Short-title articles (<=3 words, <=24 chars):')
  for (const p of shorties) {
    console.log(`- ${p.title} — ${p.slug} (words:${p.words}, chars:${p.charsNoSpace})`)
  }
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Failed to list short headings:', e)
  process.exit(1)
})

