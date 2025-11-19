import { client } from '@/lib/sanity'

function escape(str: string) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function GET() {
  const siteUrl = 'https://csuitemagazine.global'

  // Fetch latest published articles (limit to 50 for feed)
  const posts = await client.fetch(`*[_type == "post" && defined(slug.current) && count(categories) > 0 && isHidden != true] | order(publishedAt desc)[0...50] {
    title,
    excerpt,
    "slug": slug.current,
    publishedAt,
    _updatedAt,
    "categories": categories[]->{ slug }
  }`)

  const items = (posts || []).map((p: any) => {
    const primaryCat = p?.categories?.[0]?.slug?.current
    const url = `${siteUrl}/category/${primaryCat}/${p.slug}`
    const pubDate = p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString()
    return `\n    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escape(p.excerpt || '')}</description>
    </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>C-Suite Magazine</title>
    <link>${siteUrl}</link>
    <description>Leadership, innovation, and executive insights from global CXOs.</description>
    <language>en-us</language>
    <ttl>60</ttl>${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  })
}
