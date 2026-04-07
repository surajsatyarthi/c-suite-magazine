import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import CategoryClient from '@/app/category/[categorySlug]/CategoryClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/seo'
import { slugifyTag, normalizeDisplayTag } from '@/lib/tag-utils'
import { getAllUniqueTags, getTagFromSlug, getTagPosts } from '@/lib/sanity.queries'

// Revalidate once per week — deployment flushes cache on every publish
export const revalidate = 604800
export const dynamicParams = true

// Local interface if not exported
interface TagPayload {
  title: string
  slug: { current: string }
  description: string
  color: string
}

export async function generateStaticParams() {
  const tags = await getAllUniqueTags()
  const uniqueSlugs = new Set<string>()
  
  tags.forEach(tag => {
    const slug = slugifyTag(tag)
    if (slug) uniqueSlugs.add(slug)
  })
  
  return Array.from(uniqueSlugs).map((slug) => ({ tagSlug: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ tagSlug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams?.tagSlug || ''
  const originalTag = await getTagFromSlug(slug)
  const displayTitle = originalTag ? normalizeDisplayTag(originalTag) : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  
  return generateSEOMetadata({
    title: displayTitle,
    description: `Browse articles tagged with ${displayTitle}. Expert insights and leadership trends from C-Suite Magazine.`,
    url: `https://csuitemagazine.global/tag/${slug}`,
    type: 'website',
  })
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tagSlug: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams?.tagSlug?.toLowerCase()
  
  if (!slug) notFound()

  // REVERSE LOOKUP: Uses cached map
  const originalTag = await getTagFromSlug(slug)

  if (!originalTag) {
    notFound()
  }

  const posts = await getTagPosts(originalTag)

  if (!posts || posts.length === 0) {
    notFound()
  }

  // Synthesize a Category-like object for the Client Component
  const displayTitle = normalizeDisplayTag(originalTag)
  const displayTag: TagPayload = {
    title: displayTitle,
    slug: { current: slug },
    description: `Articles tagged with #${displayTitle}`,
    color: '#082945' // Default brand blue for tags
  }

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: `Tag: ${displayTag.title}` }]} />
      
      <main className="min-h-screen bg-gray-50">
        {/* Tag Header */}
        <div
          className="dark-section py-16 text-white"
          style={{ backgroundColor: displayTag.color }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-white/10 rounded-full">
              Topic
            </span>
            <h1 className="text-4xl font-serif font-black mb-4">
              {displayTag.title}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {displayTag.description}
            </p>
          </div>
        </div>

        {/* Reuse CategoryClient for Grid & Pagination */}
        <CategoryClient posts={posts} category={displayTag} />
      </main>

      <Footer />
    </>
  )
}
