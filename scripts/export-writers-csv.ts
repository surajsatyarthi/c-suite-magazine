#!/usr/bin/env tsx
// Export only writers (non-CXO authors) with profile links to CSV

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Business rule: no CXO will be a writer
const CXO_SLUGS = new Set([
  'angelina-usanova',
  'olga-denysiuk',
  'stoyana-natseva',
  'brianne-howey',
  'dr-basma-ghandourah',
  'erin-krueger',
  'bill-faruki',
  'pankaj-bansal',
  'supreet-nagi',
  'swami-aniruddha',
  'bryce-tully',
  'cal-riley',
  'john-zangardi',
  'bryan-smeltzer',
  'dean-fealk',
  'benjamin-borketey',
])

type Row = {
  name: string
  slug?: string
  authored: number
}

async function fetchRows(): Promise<Row[]> {
  const rows: Row[] = await client.fetch(`
    *[_type == "writer"] | order(name asc) {
      name,
      "slug": slug.current,
      "authored": count(*[_type == "post" && writer._ref == ^._id])
    }
  `)
  return rows
}

function toCsv(rows: Row[]): string {
  const header = ['name','slug','authored_count','profile_url'].join(',')
  const lines = [header]
  for (const r of rows) {
    const slug = r.slug || ''
  const profileUrl = slug ? `http://localhost:3000/writer/${slug}` : ''
    const fields = [
      r.name.replace(/,/g, ' '),
      slug,
      String(r.authored || 0),
      profileUrl,
    ]
    lines.push(fields.join(','))
  }
  return lines.join('\n') + '\n'
}

async function main() {
  try {
    const rows = await fetchRows()
    const writers = rows
      .filter(r => (r.authored || 0) > 0)
      .filter(r => r.slug ? !CXO_SLUGS.has(r.slug) : true)
    const csv = toCsv(writers)
    const outPath = path.join(__dirname, '..', 'tmp-writers.csv')
    fs.writeFileSync(outPath, csv, 'utf8')
    console.log(outPath)
  } catch (err: any) {
    console.error('Failed to export writers CSV:', err?.message || err)
    process.exit(1)
  }
}

main()
