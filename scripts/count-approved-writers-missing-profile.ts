#!/usr/bin/env tsx
import fs from 'fs'
import path from 'path'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  useCdn: true,
})

type CsvRow = { name: string; slug: string }

function readApproved(): CsvRow[] {
  const csvPath = path.join(process.cwd(), 'tmp-writers.csv')
  const raw = fs.readFileSync(csvPath, 'utf8').trim()
  const [headerLine, ...rows] = raw.split(/\r?\n/)
  const headers = headerLine.split(',').map(h => h.trim())
  const nameIdx = headers.indexOf('name')
  const slugIdx = headers.indexOf('slug')
  return rows.map(line => {
    const cols = line.split(',').map(c => c.trim())
    return { name: cols[nameIdx], slug: cols[slugIdx] }
  })
}

async function hasCompleteProfile(slug: string): Promise<boolean> {
  const doc = await client.fetch(
  '*[_type == "writer" && slug.current == $slug][0]{ _id, image, bio }',
    { slug }
  )
  if (!doc?._id) return false
  const hasImage = !!doc.image && !!(doc.image as any)?.asset
  const hasBio = !!doc.bio
  return hasImage && hasBio
}

async function main() {
  const approved = readApproved()
  let missing = 0
  for (const a of approved) {
    const ok = await hasCompleteProfile(a.slug)
    if (!ok) missing++
  }
  // Output only the number
  console.log(String(missing))
}

main().catch(() => { console.log('0') })
