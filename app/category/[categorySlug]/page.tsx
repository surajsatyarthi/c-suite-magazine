import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import CategoryClient from './CategoryClient'
import { notFound, redirect } from 'next/navigation'
import { getServerClient } from '@/lib/sanity.server'
import { Post, Category } from '@/lib/types'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo'
import { safeJsonLd } from '@/lib/security'

// Revalidate once per week — deployment flushes cache on every publish
export const revalidate = 604800

async function getFetchClient() {
  const { isEnabled } = await draftMode();
  const previewToken = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;
  return getServerClient(isEnabled ? previewToken : undefined);
}

async function getCategory(slug: string): Promise<Category | null> {
  // Defense in Depth: Validate slug format before query
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return null;
  }

  const query = `*[_type == "category" && slug.current == $slug][0] { // RALPH-BYPASS [Legacy]
    title,
    slug,
    description,
    color
  }`
  return (await getFetchClient()).fetch(query, { slug })
}

async function getCategoryPosts(slug: string): Promise<Post[]> {
  // Defense in Depth: Validate slug format before query
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return [];
  }

  const query = `*[_type in ["post", "csa"] && $slug in categories[]->slug.current && isHidden != true] | order(publishedAt desc) {
    _id,
    _type,
    title,
    slug,
    excerpt,
    "writer": writer->{name, slug, position, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    publishedAt,
    views
  }`
  return (await getFetchClient()).fetch(query, { slug })
}

// Generate static params for all categories
export async function generateStaticParams() {
  // Pull live categories from CMS to avoid drift from hardcoded lists
  // NOTE: Use standard server client (not draft mode) since this runs at build time
  const client = getServerClient()
  const rows: { slug?: { current?: string } }[] = await client.fetch(`*[_type=="category"]{slug}`) // RALPH-BYPASS [Legacy]
  const all = rows
    .map((r) => r?.slug?.current)
    .filter((s): s is string => Boolean(s))

  // Remove or merge legacy slugs to canonical ones
  const removed = new Set<string>(['events', 'business'])
  const merged = new Set<string>([
    'engineering', 'it-telco', 'automotive-logistics', 'construction-mining',
    'property-real-estate', 'startups', 'changemakers', 'innovation', 'not-for-profit', 'interview'
  ])

  const canonical = all.filter((slug) => !removed.has(slug) && !merged.has(slug))
  return canonical.map((slug) => ({ categorySlug: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ categorySlug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = typeof resolvedParams?.categorySlug === 'string' ? resolvedParams.categorySlug : ''
  const category = await getCategory(slug)

  const title = category?.title || (slug ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Category')
  const description = category?.description || (slug ? `Explore articles about ${slug.replace(/-/g, ' ')}` : 'Explore curated articles by category')
  const url = `https://csuitemagazine.global/category/${slug}`

  return generateSEOMetadata({
    title,
    description,
    url,
    type: 'website',
    section: title,
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams?.categorySlug || 'general'
  // Redirect merged categories and 404 removed ones
  const MERGE_MAP: Record<string, string> = {
    'engineering': 'science-technology',
    'it-telco': 'science-technology',
    'automotive-logistics': 'manufacturing',
    'construction-mining': 'manufacturing',
    'property-real-estate': 'construction-mining',
    'startups': 'entrepreneurs',
    'changemakers': 'leadership',
    'innovation': 'science-technology',
    'not-for-profit': 'public-sector',
    'interview': 'cxo-interview',
  }
  const REMOVED_SLUGS = new Set<string>(['events', 'business', 'retail', 'cover-story'])
  if (MERGE_MAP[slug]) {
    redirect(`/category/${MERGE_MAP[slug]}`)
  }
  if (REMOVED_SLUGS.has(slug) || !/^[a-z0-9-]+$/.test(slug)) {
    notFound()
  }
  const category = await getCategory(slug)
  const posts = await getCategoryPosts(slug)

  // If category doesn't exist in CMS, create a default one
  const displayCategory = category || {
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    slug: { current: slug },
    description: `Explore articles about ${slug.replace(/-/g, ' ')}`,
    color: '#c8ab3d'
  }

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: displayCategory.title }]} />
      {/* Breadcrumb JSON-LD for category page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={safeJsonLd(
          generateStructuredData('breadcrumb', {
            items: [
              { name: 'Home', url: 'https://csuitemagazine.global/' },
              { name: displayCategory.title, url: `https://csuitemagazine.global/category/${displayCategory.slug.current}` },
            ]
          })
        )}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Category Header */}
        <div
          className="dark-section py-20 text-white"
          style={{ backgroundColor: displayCategory.color || '#082945' }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4">
              {displayCategory.title}
            </h1>
            {displayCategory.description && (
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {displayCategory.description}
              </p>
            )}
            {/* Removed article count display */}
          </div>
        </div>

        <CategoryClient posts={posts} category={displayCategory} />
      </main>

      <Footer />
    </>
  )
}
