#!/usr/bin/env tsx
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  useCdn: true,
})

async function main() {
  // Count authors missing bio or image
  const result = await client.fetch<number>(
  `count(*[_type == "writer" && (!defined(image.asset) || !defined(bio))])`
  )
  // Output only the number
  console.log(String(result || 0))
}

main().catch(() => { console.log('0') })
