#!/usr/bin/env node
/**
 * Remove popup ads completely from three CSA articles:
 * - jitu-virwani-embassy-group-youthful-promise
 * - pavitra-shankar-brigade-group-sustainable-growth
 * - tikam-jain-lodha-group-pune
 *
 * Actions:
 * 1. Unset popupAd field
 * 2. Remove triggersPopup from all body image blocks
 */

const { createClient } = require('@sanity/client')

const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN // eslint-disable-line no-process-env

if (!SANITY_TOKEN) {
  console.error('Missing SANITY_API_TOKEN env var')
  process.exit(1)
}

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2024-10-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

const SLUGS = [
  'jitu-virwani-embassy-group-youthful-promise',
  'pavitra-shankar-brigade-group-sustainable-growth',
  'tikam-jain-lodha-group-pune',
]

async function removePopups() {
  for (const slug of SLUGS) {
    console.log(`\nProcessing: ${slug}`)

    // Fetch the document
    const doc = await client.fetch(
      `*[_type == "csa" && slug.current == $slug][0]{ _id, body, popupAd }`,
      { slug }
    )

    if (!doc) {
      console.log(`  ❌ Not found`)
      continue
    }

    console.log(`  Found doc: ${doc._id}`)
    console.log(`  Has popupAd: ${!!doc.popupAd}`)

    // Build unset list: popupAd + all triggersPopup flags
    const body = doc.body || []
    const unsetFields = ['popupAd']
    let patchCount = 0

    body.forEach((block, idx) => {
      if (block._type === 'image' && block.triggersPopup) {
        unsetFields.push(`body[${idx}].triggersPopup`)
        patchCount++
        console.log(`  Removing triggersPopup from body[${idx}] (key: ${block._key})`)
      }
    })

    await client.patch(doc._id).unset(unsetFields).commit()
    console.log(`  ✅ Cleared popupAd + ${patchCount} triggersPopup flag(s)`)
  }

  console.log('\n✅ Done — popups removed from all 3 articles.')
}

removePopups().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
