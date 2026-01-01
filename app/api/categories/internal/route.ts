import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { writeClient } from '@/lib/sanityWrite'

/**
 * Internal API for category counts - should NEVER be exposed publicly
 * This is for admin/internal use only
 */

export async function GET() {
  const query = `*[_type == "category" && defined(slug.current)] | order(title asc) {
    title,
    "slug": slug.current,
    "count": count(*[_type in ["post", "csa"] && isHidden != true && references(^._id)])
  }`
  
  try {
    if (writeClient) {
      const cats = await writeClient.fetch(query)
      const items = Array.isArray(cats) ? cats.filter((c: any) => c && typeof c.title === 'string') : []
      if (items.length) {
        const res = NextResponse.json({ categories: items })
        res.headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
        return res
      }
    }
    const cats = await client.fetch(query)
    const items = Array.isArray(cats) ? cats.filter((c: any) => c && typeof c.title === 'string') : []
    if (items.length) {
      const res = NextResponse.json({ categories: items })
      res.headers.set('Cache-Control', 's-maxage=600, stale-while-revalidate=86400')
      return res
    }
  } catch (err) {
    console.error('[api/categories/internal] Failed to fetch categories:', err)
  }
  
  return NextResponse.json({ categories: [] }, { status: 500 })
}