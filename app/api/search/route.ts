import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export const revalidate = 0

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = (url.searchParams.get('q') || '').trim()
  if (!q) {
    return NextResponse.json({ results: [] })
  }
  const safe = q.replace(/\s+/g, ' ').slice(0, 80)
  const pattern = `*${safe}*`
  const query = `*[_type == "post" && isHidden != true && (title match $pattern || lower(title) match $pattern)] | order(publishedAt desc) [0...10] {
    _id,
    title,
    slug,
    "category": categories[0]->{ title, slug }
  }`
  const results = await client.fetch(query, { pattern })
  return NextResponse.json({ results })
}

