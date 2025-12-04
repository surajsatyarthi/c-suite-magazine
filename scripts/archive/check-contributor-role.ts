#!/usr/bin/env tsx
import { createClient } from '@sanity/client'
import 'dotenv/config'

const slugArg = process.argv[2] || 'sofia-alvarez'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function main() {
  const person = await client.fetch(
    '*[_type == "writer" && slug.current == $slug][0]{ _id, name, "slug": slug.current }',
    { slug: slugArg }
  )

  if (!person?._id) {
    console.log(`No writer found for slug: ${slugArg}`)
    process.exit(0)
  }

  const authored = await client.fetch(
    'count(*[_type == "post" && writer._ref == $id])',
    { id: person._id }
  )
  const edited = await client.fetch(
    'count(*[_type == "post" && editor._ref == $id])',
    { id: person._id }
  )

  console.log(`Name: ${person.name}`)
  console.log(`Slug: ${person.slug}`)
  console.log(`Authored articles: ${authored}`)
  console.log(`Edited articles: ${edited}`)
}

main().catch((e) => {
  console.error('Failed to check role:', e && e.message ? e.message : e)
  process.exit(2)
})
