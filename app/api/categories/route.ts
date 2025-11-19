import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { writeClient } from '@/lib/sanityWrite'

const fallbackCategories = [
  { title: 'Leadership', slug: 'leadership' },
  { title: 'Innovation', slug: 'innovation' },
  { title: 'Money & Finance', slug: 'money-and-finance' },
  { title: 'Startups', slug: 'startups' },
  { title: 'Healthcare', slug: 'healthcare' },
]

export async function GET() {
  // Business rule: Never expose article counts publicly
  // Public API should return only categories that have at least one article,
  // without leaking the actual counts.
  const query = `*[_type == "category" && defined(slug.current) && count(*[_type == "post" && isHidden != true && references(^._id)]) > 0] | order(title asc) {
    title,
    "slug": slug.current
  }`
  try {
    if (writeClient) {
      try {
        const cats = await writeClient.fetch(query)
        const items = Array.isArray(cats) ? cats.filter((c: any) => c && typeof c.title === 'string') : []
        if (items.length) {
          const res = NextResponse.json({ categories: items })
          res.headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
          return res
        }
      } catch (e) {
        // Fall back to read client if write client fails (eg. missing/invalid token)
      }
    }
    try {
      const cats = await client.fetch(query)
      const items = Array.isArray(cats) ? cats.filter((c: any) => c && typeof c.title === 'string') : []
      if (items.length) {
        const res = NextResponse.json({ categories: items })
        res.headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
        return res
      }
    } catch (e) {
      // Ignore and fall through to fallback
    }
  } catch (err) {
    console.error('[api/categories] Failed to fetch categories:', err)
  }
  const res = NextResponse.json({ categories: fallbackCategories })
  res.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=86400')
  return res
}
