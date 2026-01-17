import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import MagazineGallery from '@/components/MagazineGallery'
import IndustryJuggernauts from '@/components/IndustryJuggernauts'
import GuestAuthors from '@/components/GuestAuthors'
import LatestInsights from '@/components/LatestInsights'
import { client } from '@/lib/sanity'
import { Post } from '@/lib/types'
import type { Metadata } from 'next'
import { generateMetadata, generateStructuredData } from '@/lib/seo'
import { getAllExecutivesWithCompensation } from '@/lib/db'
import { safeJsonLd } from '@/lib/security'
import HomepageAdTrigger from '@/components/HomepageAdTrigger'

export const metadata: Metadata = generateMetadata({
  title: 'C-Suite Magazine - Leadership, Innovation & Executive Insights',
  description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.',
  keywords: ['CEO', 'CXO', 'leadership', 'business strategy', 'executive insights', 'innovation', 'management', 'corporate leadership'],
  type: 'website'
})

// Ensure homepage content refreshes periodically and doesn’t freeze test data into static build
export const revalidate = 600

// Helper: wrap Sanity client.fetch with a soft timeout so homepage never stalls
async function fetchWithTimeout<T>(promise: Promise<T>, ms = 1800, onTimeout?: () => void): Promise<T | null> {
  return await Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => {
      try { onTimeout?.() } catch { }
      resolve(null)
    }, ms))
  ])
}


async function getLatestPosts(excludeSlugs: string[] = []): Promise<Post[]> {
  // Get latest articles ensuring different categories for Latest Insights
  const query = `*[_type == "post" && defined(mainImage.asset) && !(slug.current in $excludeSlugs) && isHidden != true] | order(publishedAt desc) {
    _id, title, slug, excerpt,
    "writer": writer->{name, slug, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    tags, publishedAt, views
  }`
  try {
    const juggernautSlugs = await getJuggernautExcludeSlugs()
    const allExcludeSlugs = [...new Set([...excludeSlugs, ...juggernautSlugs])]

    const allResults = await fetchWithTimeout(
      client.fetch(query, { excludeSlugs: allExcludeSlugs }, { next: { revalidate: 600 } }),
      1500
    )

    if (!Array.isArray(allResults)) return []

    // Select articles ensuring different categories
    const selectedPosts: Post[] = []
    const usedCategories = new Set<string>()

    for (const post of allResults) {
      const categories = (post as any)?.categories || []
      const primaryCategory = categories[0]?.title || 'Uncategorized'

      // Skip if we already have an article from this category
      if (usedCategories.has(primaryCategory)) continue

      selectedPosts.push(post as Post)
      usedCategories.add(primaryCategory)

      // Stop once we have 6 articles from different categories
      if (selectedPosts.length >= 6) break
    }

    return selectedPosts
  } catch (e) {
    console.error('Error fetching latest posts:', e)
    return []
  }
}

async function getSpotlightExcludeSlugs(spotlightItems: any[]): Promise<string[]> {
  try {
    const slugs = spotlightItems
      .map(item => {
        const href = item?.href || ''
        const parts = href.split('/').filter(Boolean)
        return parts.length ? parts[parts.length - 1] : ''
      })
      .filter(Boolean)
    if (!slugs.includes('stoyana-natseva')) slugs.push('stoyana-natseva')
    return slugs
  } catch (e) {
    console.warn('Failed to extract spotlight slugs; proceeding with minimal guard:', e)
    return ['stoyana-natseva']
  }
}

async function getJuggernautExcludeSlugs(): Promise<string[]> {
  try {
    // Fetch links from the config singleton
    const config = await client.fetch(
      `*[_type == "industryJuggernautConfig"][0].items[].link`,
      {},
      { next: { revalidate: 600 } }
    )

    if (!Array.isArray(config)) return []

    // Extract slugs from links (assuming format /category/cat/slug or just /slug)
    const slugs = config
      .map((link: string) => {
        if (!link) return ''
        const parts = link.split('/').filter(Boolean)
        return parts.length > 0 ? parts[parts.length - 1] : ''
      })
      .filter(Boolean)

    return slugs
  } catch (e) {
    console.warn('Failed to fetch juggernaut slugs:', e)
    return []
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

import { getSpotlightItems, processSpotlightItems } from '@/lib/spotlight'

export default async function Home() {
  try {
    const { items: rawSpotlightItems, desiredCount } = await getSpotlightItems()
    const spotlightItems = processSpotlightItems(rawSpotlightItems, desiredCount)
    const spotlightSlugs = await getSpotlightExcludeSlugs(spotlightItems)
    const latestArticles = await getLatestPosts(spotlightSlugs)

    // Fetch top 3 executives by compensation from database
    const topExecutives = await getAllExecutivesWithCompensation(3)

    return (
      <>
        <Navigation />

        {/* Enhanced Structured Data */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line no-restricted-syntax -- Verified Safe: Uses safeJsonLd sanitizer
          dangerouslySetInnerHTML={safeJsonLd(generateStructuredData('organization', {
            name: 'C-Suite Magazine',
            description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.',
            url: 'https://csuitemagazine.global',
            logo: 'https://csuitemagazine.global/logo.png'
          }))}
        />

        <main>
          {/* Hero Section with Parallax */}
          <Hero bannerImage={spotlightItems[0]?.rawImage} />

          {/* Magazine Gallery */}
          <MagazineGallery items={spotlightItems} />

          {/* Homepage Popup Ad Trigger (A/B Test Variant) */}
          <HomepageAdTrigger />

          {/* Commenting out bottom half for binary search
          <IndustryJuggernauts items={spotlightItems} />
          <GuestAuthors />
          <LatestInsights articles={latestArticles} />
          <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
            ...
          </section>
          */}
        </main>

        <Footer />
      </>
    )
  } catch (error) {
    console.error('[homepage] Fatal rendering error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#082945] text-white p-8 text-center">
        <div>
          <h1 className="text-4xl font-serif font-black mb-4">Under Maintenance</h1>
          <p className="text-xl opacity-80 mb-8">We're currently updating our homepage to bring you the best experience.</p>
          <div className="text-sm opacity-50 font-mono">
            Error Reference: { (error as Error).message || 'Unknown' }
          </div>
          <div className="mt-8">
            <Link href="/executive-salaries" className="text-[#c8ab3d] font-bold hover:underline">
              View Executive Salaries →
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
