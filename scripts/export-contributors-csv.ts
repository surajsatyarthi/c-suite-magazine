#!/usr/bin/env tsx
// Export writers-only CSV (exclude CXO authors) with profile links

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

type Row = {
  _id: string
  name: string
  slug?: string
  authored: number
  edited: number
}

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

async function fetchRows(): Promise<Row[]> {
  const rows: Row[] = await client.fetch(`
*[_type == "writer"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
  "authored": count(*[_type == "post" && writer._ref == ^._id]),
      "edited": count(*[_type == "post" && editor._ref == ^._id])
    }
  `)
  return rows
}

function toCsv(rows: Row[]): string {
  const header = ['name','slug','roles','authored_count','edited_count','profile_url'].join(',')
  const lines = [header]
  for (const r of rows) {
    const slug = r.slug || ''
    const isCXO = slug ? CXO_SLUGS.has(slug) : false
    // Writers-only view: exclude CXOs; roles start with writer
    if ((r.authored || 0) <= 0) continue
    if (isCXO) continue
    const roles: string[] = ['writer']
    if (r.edited > 0) roles.push('editor')
    const rolesStr = roles.join('|')
  const profileUrl = slug ? `http://localhost:3000/writer/${slug}` : ''
    const fields = [
      r.name.replace(/,/g, ' '),
      slug,
      rolesStr,
      String(r.authored || 0),
      String(r.edited || 0),
      profileUrl,
    ]
    lines.push(fields.join(','))
  }
  return lines.join('\n') + '\n'
}

async function main() {
  try {
    const rows = await fetchRows()
    const csv = toCsv(rows)
    const outPath = path.join(__dirname, '..', 'tmp-contributors.csv')
    fs.writeFileSync(outPath, csv, 'utf8')
    console.log(outPath)
  } catch (err: any) {
    console.error('Failed to export contributors CSV:', err?.message || err)
    process.exit(1)
  }
}

main()
