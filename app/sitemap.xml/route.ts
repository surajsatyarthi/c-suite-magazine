import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { getExecutiveSlugs } from '@/lib/db'

export async function GET() {
  const baseUrl = 'https://csuitemagazine.global'
  const formatLastMod = (lm?: string | Date) => {
    if (!lm) return ''
    return typeof lm === 'string' ? lm : lm.toISOString()
  }
  
  // Get all published articles
  const posts = await client.fetch(`
    *[_type == "post" && defined(slug.current) && count(categories) > 0 && isHidden != true] {
      slug,
      publishedAt,
      _updatedAt,
      "categories": categories[]->{ slug }
    }
  `)

  // Get all categories
  const categories = await client.fetch(`
    *[_type == "category" && defined(slug.current)] {
      slug,
      _updatedAt
    }
  `)

  // Get all executive salary pages
  let executiveSlugs: string[] = []
  try {
    executiveSlugs = await getExecutiveSlugs()
  } catch (error) {
    console.warn('[sitemap] Failed to fetch executive slugs:', error)
  }

  const sitemap: MetadataRoute.Sitemap = [
    // Static pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // Executive hub page - high priority for SEO
    {
      url: `${baseUrl}/executive-salaries`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    // Category pages
    ...categories.map((category: any) => ({
      url: `${baseUrl}/category/${category.slug.current}`,
      lastModified: new Date(category._updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // Executive salary pages - high priority for SEO
    ...executiveSlugs.map((slug) => ({
      url: `${baseUrl}/executive-salaries/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    // Article pages (category + title only)
    ...posts.map((post: any) => ({
      url: `${baseUrl}/category/${post?.categories?.[0]?.slug?.current}/${post.slug.current}`,
      lastModified: new Date(post._updatedAt || post.publishedAt),
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
