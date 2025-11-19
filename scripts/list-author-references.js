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
  const docs = await client.fetch('*[_type != "author" && references(*[_type == "author"]._id)]{ _id, _type }')
  if (!docs.length) {
    console.log('No documents reference legacy author docs.')
    return
  }
  console.log(`Found ${docs.length} documents referencing author docs:`)
  for (const d of docs) {
    console.log(`- ${d._id} (${d._type})`)
  }
}

main().catch((err) => {
  console.error('List references failed:', err.message)
  process.exit(1)
})

