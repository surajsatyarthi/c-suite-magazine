#!/usr/bin/env node
// Migrate legacy `editor` field to `writer` and remove `editor` from all posts
// Usage:
//   node scripts/migrate-editor-to-writer.js          # dry run
//   node scripts/migrate-editor-to-writer.js --apply  # apply changes

const { createClient } = require('@sanity/client')

try {
  require('dotenv').config()
  require('dotenv').config({ path: '.env.local' })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
const APPLY = process.argv.includes('--apply')

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.')
  process.exit(1)
}
if (!token && APPLY) {
  console.error('Missing SANITY write token. Set SANITY_API_TOKEN in .env.local for apply mode.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

async function main() {
  const docs = await client.fetch(`*[_type == "post" && defined(editor)]{ _id, editor, writer }`)
  if (!docs.length) {
    console.log('No posts with legacy `editor` field found.')
    return
  }
  console.log(`Found ${docs.length} posts with legacy editor field`)
  let migrated = 0
  for (const d of docs) {
    const ops = {}
    const hasWriter = !!d.writer
    const editorRef = d?.editor?._ref || d?.editor?.ref || null
    if (!hasWriter && editorRef) {
      ops.writer = { _type: 'reference', _ref: editorRef }
    }
    // Always remove legacy field
    const patch = client.patch(d._id)
      .set(ops)
      .unset(['editor'])

    if (APPLY) {
      try {
        await patch.commit({ autoGenerateArrayKeys: true })
        migrated++
        console.log(`✔ Migrated ${d._id} (${hasWriter ? 'unset editor' : 'writer<-editor, unset editor'})`)
      } catch (e) {
        console.error(`✘ Failed to migrate ${d._id}:`, e?.message || e)
      }
    } else {
      console.log(`DRY-RUN ${d._id} -> ${JSON.stringify(ops)} + unset(editor)`) 
    }
  }
  if (APPLY) console.log(`Done. Migrated ${migrated}/${docs.length}`)
}

main().catch((e) => {
  console.error('Migration failed:', e?.message || e)
  process.exit(1)
})

