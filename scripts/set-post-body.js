#!/usr/bin/env node
// Set a post's Portable Text body blocks by slug
// Usage: SANITY_WRITE_TOKEN=<token> node scripts/set-post-body.js --slug angelina-usanova --h2 "Aspirations and Lasting Legacy" --p "<paragraph text>"

const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28'
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN

if (!token) {
  console.error('Missing write token: set SANITY_WRITE_TOKEN (or SANITY_API_TOKEN)')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function getArg(flag) {
  const idx = process.argv.indexOf(flag)
  return idx > -1 ? process.argv[idx + 1] : undefined
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<\/?(h\d|p|div|span|em|strong|br)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function blocksFrom(h2, p) {
  const blocks = []
  if (h2) {
    blocks.push({ _type: 'block', style: 'h2', children: [{ _type: 'span', text: stripHtml(h2) }], markDefs: [] })
  }
  if (p) {
    blocks.push({ _type: 'block', style: 'normal', children: [{ _type: 'span', text: stripHtml(p) }], markDefs: [] })
  }
  return blocks
}

async function main() {
  const slug = getArg('--slug')
  const h2 = getArg('--h2')
  const p = getArg('--p')
  if (!slug || (!h2 && !p)) {
    console.error('Usage: node scripts/set-post-body.js --slug <slug> --h2 "Heading" --p "Paragraph"')
    process.exit(2)
  }

  const post = await client.fetch('*[_type=="post" && slug.current==$slug][0]{ _id, title }', { slug })
  if (!post?._id) {
    console.error(`Post not found for slug: ${slug}`)
    process.exit(3)
  }

  const body = blocksFrom(h2, p)
  await client.patch(post._id).set({ body }).commit()
  console.log(`✔ Set body for ${slug} with ${body.length} blocks`)
}

main().catch((e) => { console.error('Failed to set body:', e.message); process.exit(1) })

