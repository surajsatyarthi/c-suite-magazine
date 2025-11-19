#!/usr/bin/env node
// Remove malformed posts whose titles/authors look like RTF headers (e.g., rtf1 ansicpg cocoartf)

const { createClient } = require('@sanity/client')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  const pattern = /^(rtf\d+|ansicpg\d+|cocoartf\d+|cocoatextscaling\d+|cocoaplatform\d+|fonttbl|colortbl|expandedcolortbl|pard|viewkind\d+|f\d+|cf\d+|lang\d+)$/i
  const posts = await client.fetch('*[_type == "post"]{ _id, title, writer-> { name } }')
  const bad = posts.filter(p => pattern.test(String(p.title || '').trim()) || pattern.test(String(p.writer?.name || '').trim()))
  if (!bad.length) {
    console.log('No malformed RTF-title posts found.')
    return
  }
  for (const p of bad) {
    try {
      await client.delete(p._id)
      console.log(`🗑️  Deleted malformed post: ${p._id} (title: ${p.title})`)
    } catch (e) {
      console.warn(`Failed to delete ${p._id}:`, e.message)
    }
  }
}

if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Cleanup failed:', e)
  process.exit(1)
})
