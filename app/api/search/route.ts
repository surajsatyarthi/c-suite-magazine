import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export const revalidate = 60

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const q = (url.searchParams.get('q') || '').trim()
    if (!q) {
      return NextResponse.json({ results: [] })
    }
    const safe = q.replace(/\s+/g, ' ').slice(0, 80)
    const pattern = `*${safe}*`
    const query = `*[_type in ["post", "csa"] && isHidden != true && (title match $pattern || lower(title) match $pattern)] | order(publishedAt desc) [0...10] {
      _id,
      _type,
      title,
      slug,
      "categories": categories[]->{ title, "slug": slug.current }
    }`
    const results = await client.fetch(query, { pattern })
    return NextResponse.json({ results })
  } catch (error) {
    console.error('[api/search] Search failed:', error)
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 })
  }
}

