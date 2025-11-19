#!/usr/bin/env node
/*
  Report posts that have both writer and editor set, versus those that do not.
  Outputs CSV at exports/writer-author-report.csv with columns:
  slug,title,category,has_writer,has_editor,issue
*/

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') })

const { createClient } = require('@sanity/client')

const idRegex = /^[a-z0-9-]+$/
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
const dataset = idRegex.test(String(process.env.NEXT_PUBLIC_SANITY_DATASET || ''))
  ? String(process.env.NEXT_PUBLIC_SANITY_DATASET)
  : 'production'
const projectId = idRegex.test(String(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''))
  ? String(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
  : '2f93fcy8'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Public read-only: avoid token to prevent header issues
  useCdn: true,
})

async function main() {
  try {
    const query = `*[_type == "post"]{
      title,
      "slug": slug.current,
      "category": categories[0]->slug.current,
      "categoryTitle": categories[0]->title,
      "hasWriter": defined(writer._ref),
      "hasEditor": defined(editor._ref)
    } | order(title asc)`

    const posts = await client.fetch(query)

    const rows = posts.map(p => {
      const hasWriter = Boolean(p.hasWriter)
      const hasEditor = Boolean(p.hasEditor)
      const issue = hasWriter && hasEditor ? 'has_issue' : 'no_issue'
      const safeTitle = String(p.title || '').replace(/"/g, '""')
      return {
        slug: p.slug || '',
        title: safeTitle,
        category: p.category || '',
        has_writer: hasWriter ? 'true' : 'false',
        has_editor: hasEditor ? 'true' : 'false',
        issue,
      }
    })

    const header = 'slug,title,category,has_writer,has_editor,issue'
    const csv = [header]
      .concat(rows.map(r => `${r.slug},"${r.title}",${r.category},${r.has_writer},${r.has_editor},${r.issue}`))
      .join('\n')

    const outPath = path.join(process.cwd(), 'exports', 'writer-author-report.csv')
    fs.writeFileSync(outPath, csv, 'utf8')
    console.log(`Wrote ${rows.length} rows to ${outPath}`)
  } catch (err) {
    console.error('Failed to generate report:', err)
    process.exit(1)
  }
}

main()
