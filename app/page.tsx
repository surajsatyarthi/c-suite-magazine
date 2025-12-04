import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import MagazineGallery from '@/components/MagazineGallery'
import IndustryJuggernauts from '@/components/IndustryJuggernauts'
import GuestAuthors from '@/components/GuestAuthors'
import LatestInsights from '@/components/LatestInsights'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'
import type { Metadata } from 'next'
import { generateMetadata, generateStructuredData } from '@/lib/seo'
import path from 'path'
import fs from 'fs/promises'

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


async function getLatestPosts(): Promise<Post[]> {
  // Get latest articles ensuring different categories for Latest Insights
  const query = `*[_type == "post" && defined(mainImage.asset) && !(slug.current in $excludeSlugs) && isHidden != true] | order(publishedAt desc) {
    _id, title, slug, excerpt,
    "writer": writer->{name, slug, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    tags, publishedAt, views
  }`
  try {
    const excludeSlugs = await getSpotlightExcludeSlugs()
    const allResults = await fetchWithTimeout(
      client.fetch(query, { excludeSlugs }, { next: { revalidate: 600 } }),
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

async function getSpotlightExcludeSlugs(): Promise<string[]> {
  try {
    const spotlightPath = path.join(process.cwd(), 'public', 'spotlight.json')
    const raw = await fs.readFile(spotlightPath, 'utf-8')
    const data = JSON.parse(raw) as Array<{ href?: string }>
    const slugs = data
      .map(item => {
        const href = item?.href || ''
        const parts = href.split('/').filter(Boolean)
        return parts.length ? parts[parts.length - 1] : ''
      })
      .filter(Boolean)
    if (!slugs.includes('stoyana-natseva')) slugs.push('stoyana-natseva')
    return slugs
  } catch (e) {
    console.warn('Failed to read spotlight.json; proceeding with minimal guard:', e)
    return ['stoyana-natseva']
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
  const latestArticles = await getLatestPosts()
  const { items: rawSpotlightItems, desiredCount } = await getSpotlightItems()
  const spotlightItems = processSpotlightItems(rawSpotlightItems, desiredCount)

  return (
    <>
      <Navigation />

      {/* Enhanced Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData('organization', {
            name: 'C-Suite Magazine',
            description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.',
            url: 'https://csuitemagazine.global',
            logo: 'https://csuitemagazine.global/logo.png'
          })),
        }}
      />

      <main>
        {/* Hero Section with Parallax */}
        <Hero />

        {/* Magazine Gallery */}
        <MagazineGallery items={spotlightItems} />

        {/* Industry Juggernauts */}
        <IndustryJuggernauts items={spotlightItems} />

        {/* Guest Authors */}
        <GuestAuthors />

        {/* Latest Insights */}
        <LatestInsights articles={latestArticles} />
      </main>

      <Footer />
    </>
  )
}
