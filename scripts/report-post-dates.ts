import fs from 'fs'
import path from 'path'
import { createClient } from '@sanity/client'
import { config as dotenvConfig } from 'dotenv'

function getEnv(key: string, fallback?: string) {
  return process.env[key] || fallback || ''
}

function requireEnv(key: string): string {
  const val = getEnv(key)
  if (!val) throw new Error(`Missing required env: ${key}`)
  return val
}

async function main() {
  // Load .env.local explicitly to ensure client configuration
  const envLocal = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envLocal)) {
    dotenvConfig({ path: envLocal, override: true })
  } else {
    // Fallback to default .env if present
    const envDefault = path.join(process.cwd(), '.env')
    if (fs.existsSync(envDefault)) dotenvConfig({ path: envDefault, override: true })
  }

  const projectId = requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID')
  const dataset = requireEnv('NEXT_PUBLIC_SANITY_DATASET')
  const apiVersion = getEnv('NEXT_PUBLIC_SANITY_API_VERSION', '2025-10-28')
  const token = getEnv('SANITY_API_TOKEN')

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

  const query = `*[_type == "post"] | order(publishedAt desc, _createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    _createdAt,
    _updatedAt,
  "writerName": writer->name,
  "writerSlug": writer->slug.current,
    "categories": categories[]->slug.current
  }`

  const posts: any[] = await client.fetch(query)
  const rows: string[] = []
  rows.push([
    'id',
    'title',
    'slug',
  'writer',
    'writer_slug',
    'primary_category',
    'publishedAt',
    '_createdAt',
    '_updatedAt',
    'published_year',
    'date_status'
  ].join(','))

  const byYear: Record<string, number> = {}
  let missingPublished = 0
  let inFuture = 0
  let veryOld = 0 // before 2018

  for (const p of posts) {
    const pub = p?.publishedAt ? String(p.publishedAt) : ''
    const created = p?._createdAt ? String(p._createdAt) : ''
    const updated = p?._updatedAt ? String(p._updatedAt) : ''
    const primaryCat = Array.isArray(p?.categories) && p.categories.length ? String(p.categories[0]) : ''
    let year = ''
    let status = 'ok'
    if (!pub) {
      status = 'missing_publishedAt'
      missingPublished++
    } else {
      const d = new Date(pub)
      if (!isNaN(d.getTime())) {
        year = String(d.getUTCFullYear())
        byYear[year] = (byYear[year] || 0) + 1
        const now = new Date()
        if (d.getTime() > now.getTime() + 24 * 3600 * 1000) {
          status = 'future_date'
          inFuture++
        }
        if (d.getUTCFullYear() < 2018) {
          status = 'very_old'
          veryOld++
        }
      } else {
        status = 'invalid_date'
      }
    }
    rows.push([
      JSON.stringify(p._id),
      JSON.stringify(String(p.title || '').replace(/\s+/g, ' ').trim()),
      JSON.stringify(String(p.slug || '')),
      JSON.stringify(String(p.writerName || '')),
  JSON.stringify(String(p.writerSlug || '')),
      JSON.stringify(primaryCat),
      JSON.stringify(pub),
      JSON.stringify(created),
      JSON.stringify(updated),
      JSON.stringify(year),
      JSON.stringify(status)
    ].join(','))
  }

  const outPath = path.join(process.cwd(), 'tmp-post-date-report.csv')
  fs.writeFileSync(outPath, rows.join('\n'))

  // Console summary
  const total = posts.length
  const yearLines = Object.entries(byYear)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([y, c]) => `  ${y}: ${c}`)
  console.log(`Total articles: ${total}`)
  console.log('By published year:')
  console.log(yearLines.join('\n') || '  (no publishedAt values)')
  console.log(`Missing publishedAt: ${missingPublished}`)
  console.log(`Very old (<2018): ${veryOld}`)
  console.log(`Future dates: ${inFuture}`)
  console.log(`CSV written: ${outPath}`)
}

// Ensure global fetch for @sanity/client if needed on older Node
if (typeof (global as any).fetch === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  (global as any).fetch = require('node-fetch')
}

main().catch((e) => {
  console.error('Date report failed:', e)
  process.exit(1)
})
