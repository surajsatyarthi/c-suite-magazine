#!/usr/bin/env node
// Export all Sanity `post` documents to local JSON and Markdown files

const fs = require('fs')
const path = require('path')
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
  console.error('Missing SANITY project/dataset env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

const outDir = path.join(process.cwd(), 'exports', 'posts')

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function sanitizeSlug(slug) {
  const s = (slug || '').toString().trim()
  return s.replace(/[^a-z0-9-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$|^$/g, '') || 'untitled'
}

function blocksToMarkdown(blocks) {
  if (!Array.isArray(blocks)) return ''
  const lines = []
  for (const block of blocks) {
    if (block?._type === 'block') {
      const style = block.style || 'normal'
      const text = (block.children || []).map(c => c.text).join('')
      if (!text) continue
      if (style === 'h1') lines.push(`# ${text}`)
      else if (style === 'h2') lines.push(`## ${text}`)
      else if (style === 'h3') lines.push(`### ${text}`)
      else if (style === 'h4') lines.push(`#### ${text}`)
      else if (style === 'blockquote') lines.push(`> ${text}`)
      else lines.push(text)
    } else if (block?._type === 'image') {
      const alt = block.alt || (block.asset?._ref ? `image:${block.asset._ref}` : 'image')
      lines.push(`![${alt}](#)`)
    } else {
      // Unknown block type; skip
    }
  }
  return lines.join('\n\n')
}

async function main() {
  ensureDir(outDir)
  console.log(`Exporting posts to: ${outDir}`)

  const posts = await client.fetch(
    `*[_type == "post"]{\n` +
      `  _id, _createdAt, _updatedAt,\n` +
      `  title, slug, excerpt, isFeatured, readTime, wordCount, views,\n` +
  `  writer-> { name, slug },\n` +
      `  categories[]-> { title, slug },\n` +
      `  mainImage{ alt, asset-> { _id, url } },\n` +
      `  body\n` +
      `}`
  )

  let exported = 0
  for (const post of posts) {
    const base = sanitizeSlug(post?.slug?.current || post?._id)
    const jsonPath = path.join(outDir, `${base}.json`)
    const mdPath = path.join(outDir, `${base}.md`)

    // Write JSON snapshot
    const json = {
      _id: post._id,
      _createdAt: post._createdAt,
      _updatedAt: post._updatedAt,
      title: post.title,
      slug: post.slug?.current || null,
      excerpt: post.excerpt || null,
      isFeatured: !!post.isFeatured,
      readTime: post.readTime || null,
      wordCount: post.wordCount || null,
      views: post.views || null,
  writer: post.writer || null,
      categories: post.categories || [],
      mainImage: post.mainImage || null,
      body: post.body || [],
    }
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8')

    // Write Markdown with basic front matter and body text
    const catList = (post.categories || []).map(c => c?.title).filter(Boolean)
  const authorName = post.writer?.name || ''
    const md = [
      '---',
      `title: ${post.title || ''}`,
      `slug: ${post.slug?.current || ''}`,
  `writer: ${authorName}`,
      `categories: ${catList.join(', ')}`,
      `createdAt: ${post._createdAt || ''}`,
      `updatedAt: ${post._updatedAt || ''}`,
      '---',
      '',
      post.excerpt || '',
      '',
      blocksToMarkdown(post.body),
      '',
    ].join('\n')
    fs.writeFileSync(mdPath, md, 'utf8')

    exported++
  }

  console.log(`Exported ${exported} posts to ${outDir}`)
}

main().catch((e) => {
  console.error('Export failed:', e?.message || e)
  process.exit(2)
})
