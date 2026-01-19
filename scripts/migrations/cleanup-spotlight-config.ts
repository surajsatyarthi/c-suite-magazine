/**
 * Migration script to unset orphan 'cardCount' field from spotlightConfig document.
 * This properly aligns data with the simplified schema and removes Studio warnings.
 * 
 * Usage: npx ts-node scripts/migrations/cleanup-spotlight-config.ts
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-11',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const DRY_RUN = process.env.DRY_RUN !== 'false'

async function migrate() {
  console.log(`🚀 Starting cleanup migration... (DRY_RUN: ${DRY_RUN})`)

  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error('SANITY_WRITE_TOKEN is missing from .env.local')
  }

  // Find the spotlightConfig document
  const query = `*[_type == "spotlightConfig"][0]`
  const doc = await client.fetch(query)

  if (!doc) {
    console.log('❌ No spotlightConfig document found.')
    return
  }

  if (doc.cardCount === undefined) {
    console.log('✅ Document already clean. No "cardCount" field found.')
    return
  }

  console.log(`🔍 Found document "${doc._id}" with cardCount: ${doc.cardCount}`)

  if (DRY_RUN) {
    console.log(`✨ [DRY RUN] Would unset "cardCount" from document "${doc._id}"`)
  } else {
    console.log(`🛠️  Unsetting "cardCount" from document "${doc._id}"...`)
    await client
      .patch(doc._id)
      .unset(['cardCount'])
      .commit()
    console.log('✅ Migration complete.')
  }
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
