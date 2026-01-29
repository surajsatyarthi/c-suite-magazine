#!/usr/bin/env tsx
// Audit posts for date discrepancies: finds year mentions older than publishedAt year
// Output: tmp-date-discrepancies.csv

import { createClient } from '@sanity/client'
import { writeFileSync } from 'fs'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'

try {
  dotenvConfig({ path: path.join(__dirname, '..', '.env.local') })
} catch (_) {}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28'
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset) {
  console.error('Missing SANITY env. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local')
  process.exit(1)
}
const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

type PTBlock = {
  _type: string
  children?: { text?: string }[]
}

function extractPlainText(body: PTBlock[] | undefined): string {
  if (!body) return ''
  return body
    .filter(b => b && b._type === 'block')
    .map(b => (b.children || []).map(c => c.text || '').join(''))
    .join('\n')
}

function findOlderYears(text: string, publishedYear: number): { years: number[]; sample?: string } {
  const re = /\b(19\d{2}|20\d{2})\b/g
  const years: number[] = []
  let match: RegExpExecArray | null
  let sample: string | undefined
  while ((match = re.exec(text))) {
    const y = parseInt(match[0], 10)
    if (y < publishedYear) {
      years.push(y)
      if (!sample) {
        const start = Math.max(0, match.index - 60)
        const end = Math.min(text.length, match.index + 80)
        sample = text.slice(start, end).replace(/\s+/g, ' ').trim()
      }
    }
  }
  years.sort((a, b) => a - b)
  return { years, sample }
}

async function main() {
  console.log('Fetching posts for discrepancy audit...')
  const posts: any[] = await client.fetch(
    '*[_type == "post"]{ _id, title, slug, publishedAt, body }'
  )
  console.log(`Fetched ${posts.length} posts.`)

  type Row = {
    id: string
    slug: string
    title: string
    publishedYear: number | ''
    oldestYearFound: number | ''
    olderYearMentions: number
    sample: string
  }

  const rows: Row[] = []
  for (const p of posts) {
    const publishedYear = p.publishedAt ? new Date(p.publishedAt).getUTCFullYear() : ''
    const text = extractPlainText(p.body)
    const { years, sample } = findOlderYears(text, typeof publishedYear === 'number' ? publishedYear : 9999)
    if (years.length > 0) {
      rows.push({
        id: p._id,
        slug: p.slug?.current || '',
        title: p.title || '',
        publishedYear,
        oldestYearFound: years[0] || '',
        olderYearMentions: years.length,
        sample: sample || ''
      })
    }
  }

  const header = 'id,slug,title,publishedYear,oldestYearFound,olderYearMentions,sample\n'
  const csv = header + rows
    .map(r => [
      r.id,
      r.slug,
      r.title.replaceAll('"', '""'),
      r.publishedYear,
      r.oldestYearFound,
      r.olderYearMentions,
      r.sample.replaceAll('"', '""')
    ].map(v => `"${String(v)}"`).join(','))
    .join('\n')

  const outPath = path.join(process.cwd(), 'tmp-date-discrepancies.csv')
  writeFileSync(outPath, csv)
  console.log(`Wrote discrepancy report: ${outPath}`)
  console.log(`Rows with potential date discrepancy: ${rows.length}`)
}

main().catch(err => { console.error('Audit error:', err); process.exit(1) })

