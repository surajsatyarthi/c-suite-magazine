#!/usr/bin/env node
// Replace a substring in a post's Portable Text body by slug
// Usage: node scripts/set-post-body-replace.js <slug> "find" "replace"

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
if (!token) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function replaceAllSafe(text, find, replace) {
  if (!text || !find) return text
  const parts = String(text).split(find)
  return parts.join(replace)
}

async function main() {
  const slug = process.argv[2]
  const findText = process.argv[3]
  const replaceText = process.argv[4]
  if (!slug || !findText || typeof replaceText === 'undefined') {
    console.error('Usage: node scripts/set-post-body-replace.js <slug> "find" "replace"')
    process.exit(2)
  }

  const post = await client.fetch('*[_type == "post" && slug.current == $slug][0]{ _id, title, body }', { slug })
  if (!post?._id) {
    console.error('Post not found for slug:', slug)
    process.exit(3)
  }

  let totalReplacements = 0
  const newBody = Array.isArray(post.body) ? post.body.map((block) => {
    if (block && Array.isArray(block.children)) {
      const newChildren = block.children.map((ch) => {
        if (ch && typeof ch.text === 'string') {
          const before = ch.text
          const after = replaceAllSafe(before, findText, replaceText)
          if (after !== before) {
            totalReplacements += (before.split(findText).length - 1)
          }
          return { ...ch, text: after }
        }
        return ch
      })
      return { ...block, children: newChildren }
    }
    return block
  }) : post.body

  if (totalReplacements === 0) {
    console.warn(`No occurrences of "${findText}" found in body for ${slug}.`)
  }

  await client.patch(post._id).set({ body: newBody }).commit()
  console.log(`✔ Updated body for ${slug}. Replacements: ${totalReplacements}`)
}

// Ensure global fetch if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => { console.error('Failed to update body:', e.message); process.exit(1) })

