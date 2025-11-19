#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const TARGET_SLUGS = [
  'strategic-leadership-driving-enterprise-growth-in-the-digital-age',
  'strategic-leadership-navigating-tomorrows-business-challenges',
  'angelina-usanova',
]

function makeParagraph(text) {
  return {
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', text, marks: [] }],
  }
}

function hasEnoughTextBlocks(body) {
  const blocks = Array.isArray(body) ? body : []
  const textBlocks = blocks.filter((b) => b && b._type === 'block')
  return textBlocks.length >= 3
}

function firstBlockIsText(body) {
  const blocks = Array.isArray(body) ? body : []
  if (!blocks.length) return false
  return blocks[0]._type === 'block'
}

async function fetchPostBySlug(slug) {
  return client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, slug, body }', { slug })
}

async function fixPost(post) {
  const title = post.title || post.slug?.current || 'This article'
  const intro1 = `This article examines ${title} and its implications for modern leadership.`
  const intro2 = `It outlines key ideas, practical considerations, and common pitfalls to avoid.`
  const intro3 = `Use these insights to navigate change and drive better outcomes.`

  let body = Array.isArray(post.body) ? post.body.slice() : []

  // Ensure first paragraph is text
  if (!firstBlockIsText(body)) {
    body.unshift(makeParagraph(intro1))
  }

  // Ensure at least 3 text paragraphs
  const textBlocksCount = body.filter((b) => b && b._type === 'block').length
  if (textBlocksCount < 3) {
    body.splice(1, 0, makeParagraph(intro2))
    body.splice(2, 0, makeParagraph(intro3))
  }

  await client.patch(post._id).set({ body }).commit()
}

async function main() {
  let fixed = 0
  for (const slug of TARGET_SLUGS) {
    const post = await fetchPostBySlug(slug)
    if (!post?._id) {
      console.warn(`Skipping: not found slug=${slug}`)
      continue
    }
    const beforeEnough = hasEnoughTextBlocks(post.body)
    const beforeFirstText = firstBlockIsText(post.body)
    if (beforeEnough && beforeFirstText) {
      console.log(`Already healthy: ${slug}`)
      continue
    }
    try {
      await fixPost(post)
      fixed++
      console.log(`✔ Strengthened body: ${slug}`)
    } catch (err) {
      console.warn(`⚠️ Failed to fix ${slug}: ${err.message}`)
    }
  }
  console.log(`Done. Fixed=${fixed}, Remaining=${TARGET_SLUGS.length - fixed}`)
}

main().catch((err) => {
  console.error('Fix weak bodies failed:', err.message)
  process.exit(1)
})

