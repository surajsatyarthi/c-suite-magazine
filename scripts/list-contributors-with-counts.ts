#!/usr/bin/env tsx
// List all authors with both authored and edited article counts, presented cleanly

import { createClient } from '@sanity/client'
import 'dotenv/config'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

type Row = {
  _id: string
  name: string
  slug?: string
  authored: number
  edited: number
  hasImage: boolean
}

async function fetchRows(): Promise<Row[]> {
  const rows: Row[] = await client.fetch(`
*[_type == "writer"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
  "authored": count(*[_type == "post" && writer._ref == ^._id]),
      "edited": count(*[_type == "post" && editor._ref == ^._id]),
      "hasImage": defined(image)
    }
  `)
  return rows
}

async function main() {
  try {
    const postTotal: number = await client.fetch('count(*[_type == "post"])')
    const rows = await fetchRows()

    const authors = rows.filter(r => r.authored > 0).sort((a, b) => b.authored - a.authored)
    const editors = rows.filter(r => r.edited > 0).sort((a, b) => b.edited - a.edited)
    const writers = authors.filter(r => r.edited === 0)

    console.log('\n👥 AUTHORS (authored article count)')
    console.log('='.repeat(80))
    for (const a of authors) {
      const slug = a.slug || 'none'
      console.log(`- ${a.name.padEnd(40)} | Articles: ${String(a.authored).padEnd(3)} | Slug: ${slug} | Image: ${a.hasImage ? '✅' : '❌'}`)
    }

    console.log('\n✏️ EDITORS (edited article count)')
    console.log('='.repeat(80))
    if (!editors.length) {
      console.log('No editors assigned to posts yet.')
    } else {
      for (const e of editors) {
        const slug = e.slug || 'none'
        console.log(`- ${e.name.padEnd(40)} | Edited: ${String(e.edited).padEnd(3)} | Slug: ${slug} | Image: ${e.hasImage ? '✅' : '❌'}`)
      }
    }

    console.log('\n📝 WRITERS (authored > 0 and edited == 0)')
    console.log('='.repeat(80))
    if (!writers.length) {
      console.log('No writers identified (everyone also an editor).')
    } else {
      for (const w of writers) {
        const slug = w.slug || 'none'
        console.log(`- ${w.name.padEnd(40)} | Articles: ${String(w.authored).padEnd(3)} | Slug: ${slug} | Image: ${w.hasImage ? '✅' : '❌'}`)
      }
    }

    console.log('\n📈 SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total post documents: ${postTotal}`)
    console.log(`Authors with images: ${authors.filter(a => a.hasImage).length}/${rows.length}`)
    console.log(`Editors with images: ${editors.filter(e => e.hasImage).length}/${editors.length}`)
    console.log(`Writers with images: ${writers.filter(w => w.hasImage).length}/${writers.length}`)
  } catch (err) {
    console.error('Failed to list contributors:', err)
    process.exit(1)
  }
}

main()
