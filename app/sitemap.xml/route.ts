import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { getExecutiveSlugs } from '@/lib/db'
import { getArticleUrl } from '@/lib/urls'

export async function GET() {
  const baseUrl = 'https://csuitemagazine.global'
  const formatLastMod = (lm?: string | Date) => {
    if (!lm) return ''
    return typeof lm === 'string' ? lm : lm.toISOString()
  }
  
  // 1. Unified Article Fetch (Posts + CSA)
  // CRITICAL: Must fetch 'csa' type to ensure paid clients are indexed.
  const articles = await client.fetch(`
    *[(_type == "post" || _type == "csa") && defined(slug.current) && isHidden != true] {
      _type,
      slug,
      _updatedAt,
      publishedAt,
      "categories": categories[]->{ "slug": slug.current }
    }
  `)

  // 2. Fetch All Categories
  const categories = await client.fetch(`
    *[_type == "category" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `)

  // 3. Fetch All Tags (SEO Expansion)
  // Issue #9: Tag Landing Pages must be indexed.
  const tags = await client.fetch(`
    *[_type == "tag" && count(*[_type == "post" && references(^._id)]) > 0] {
      "slug": slug.current,
      _updatedAt
    }
  `)

  // 4. Executive Salaries (Static List from DB helper)
  let executiveSlugs: string[] = []
  try {
    executiveSlugs = await getExecutiveSlugs()
  } catch (error) {
    console.warn('[sitemap] Failed to fetch executive slugs:', error)
  }

  const sitemap: MetadataRoute.Sitemap = [
    // --- Static Core ---
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    { url: `${baseUrl}/tag`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }, // Issue #28
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/executive-salaries`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.95 },
    
    // --- Dynamic Categories ---
    ...categories.map((cat: any) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(cat._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // --- Dynamic Tags (Issue #9) ---
    ...tags.map((tag: any) => ({
      url: `${baseUrl}/tag/${tag.slug}`,
      lastModified: new Date(tag._updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),

    // --- Dynamic Articles (Post & CSA) ---
    ...articles.map((item: any) => {
      const url = `${baseUrl}${getArticleUrl(item)}`

      return {
        url,
        lastModified: new Date(item._updatedAt || item.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: item._type === 'csa' ? 1.0 : 0.9, // CSA gets top priority
      }
    }),

    // --- Executive Pages ---
    ...executiveSlugs.map((slug) => ({
      url: `${baseUrl}/executive-salaries/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map(
    (item) => `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${formatLastMod(item.lastModified)}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
