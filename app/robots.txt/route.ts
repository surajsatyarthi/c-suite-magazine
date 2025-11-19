import { MetadataRoute } from 'next'

export async function GET() {
  const baseUrl = 'https://csuitemagazine.global'
  
  const robots = `User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /studio/
Disallow: /_next/
Disallow: /private/

# Allow specific API endpoints that should be crawlable
Allow: /api/og

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
