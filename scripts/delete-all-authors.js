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

async function main() {
  const authors = await client.fetch('*[_type == "author"]{ _id, name, slug }')
  if (!authors.length) {
    console.log('No author documents to delete.')
    return
  }
  console.log(`Deleting ${authors.length} author documents...`)
  let deleted = 0
  for (const a of authors) {
    try {
      await client.delete(a._id)
      deleted++
      console.log(`✔ Deleted ${a._id} (${a.name || a.slug?.current || 'unknown'})`)
    } catch (err) {
      console.warn(`⚠️ Failed to delete ${a._id}: ${err.message}`)
    }
  }
  console.log(`Done. Deleted=${deleted}, Remaining=${authors.length - deleted}`)
}

main().catch((err) => {
  console.error('Delete failed:', err.message)
  process.exit(1)
})
