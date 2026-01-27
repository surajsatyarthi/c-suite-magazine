import { client } from '@/lib/sanity'
import { getArticleUrl } from '@/lib/urls'

function escape(str: string) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function GET() {
  try {
    const siteUrl = 'https://csuitemagazine.global'

    // Fetch latest published articles (limit to 50 for feed)
    const posts = await client.fetch(`*[_type in ["post", "csa"] && defined(slug.current) && isHidden != true] | order(publishedAt desc)[0...50] {
      title,
      excerpt,
      _type,
      slug,
      publishedAt,
      _updatedAt,
      "categories": categories[]->{ "slug": slug.current }
    }`)

    const items = (posts || []).map((p: any) => {
      const url = `${siteUrl}${getArticleUrl(p)}`
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
  } catch (error) {
    console.error('[rss.xml] Failed to generate RSS feed:', error)
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>', {
      status: 500,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    })
  }
}
