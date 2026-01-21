import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import TagClient from './TagClient'
import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/sanity.server'
import { Post } from '@/lib/types'
import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { normalizeDisplayTag } from '@/lib/tag-utils'
import { safeJsonLd } from '@/lib/security'
import { generateStructuredData } from '@/lib/seo'

// ISR: Revalidate every 10 minutes
export const revalidate = 600

async function getArticlesByTag(tag: string): Promise<Post[]> {
  // We search for articles where any tag (case-insensitive) matches our display-normalized tag
  // Note: match is case-insensitive in GROQ.
  const query = `*[_type in ["post", "csa"] && isHidden != true && count(tags[@ match $tag]) > 0] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    "writer": writer->{name, slug, position, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    publishedAt,
    views,
    tags
  }`
  const client = getServerClient()
  return client.fetch<Post[]>(query, { tag } as Record<string, string>)
}

/**
 * Generate static params for the most popular tags to ensure SEO performance
 */
export async function generateStaticParams() {
  const query = `*[_type == "post" && defined(tags)].tags`
  const client = getServerClient()
  const allTagsArrays: string[][] = await client.fetch(query)
  
  const tagCounts: Record<string, number> = {}
  allTagsArrays.flat().forEach(t => {
    const slug = t.toLowerCase().replace(/\s+/g, '-')
    tagCounts[slug] = (tagCounts[slug] || 0) + 1
  })

  // Pre-render top 100 tags
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100)
    .map(([slug]) => ({ tagSlug: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ tagSlug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.tagSlug
  const displayTag = normalizeDisplayTag(slug)
  
  const title = `Industry Insights: ${displayTag}`
  const description = `Explore the latest articles, interviews, and strategic insights about ${displayTag} from global business leaders.`
  const url = `https://csuitemagazine.global/tag/${slug}`

  return generateSEOMetadata({
    title,
    description,
    url,
    type: 'website',
    section: 'Business Intelligence',
  })
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tagSlug: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams.tagSlug
  const displayTag = normalizeDisplayTag(slug)

  const posts = await getArticlesByTag(displayTag)

  // If we have literally zero posts and it's not a common tag, we could 404
  // But for tags, usually better to show an empty state unless the slug is garbage
  if (posts.length === 0 && slug.length < 3) {
    notFound()
  }

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: `Tag: ${displayTag}` }]} />
      
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line no-restricted-syntax -- Verified Safe: Uses safeJsonLd with mandatory escaping for <, >, and &
        dangerouslySetInnerHTML={safeJsonLd(
          generateStructuredData('breadcrumb', {
            items: [
              { name: 'Home', url: 'https://csuitemagazine.global/' },
              { name: displayTag, url: `https://csuitemagazine.global/tag/${slug}` },
            ]
          })
        )}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Tag Header */}
        <div className="dark-section py-20 bg-[#082945] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-black mb-4">
              #{displayTag}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Strategic insights and executive analysis on {displayTag}
            </p>
          </div>
        </div>

        <TagClient posts={posts} tag={slug} displayTag={displayTag} />
      </main>

      <Footer />
    </>
  )
}
