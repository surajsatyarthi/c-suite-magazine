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
    const spotlightSlugs = await getSpotlightExcludeSlugs()
    const juggernautSlugs = await getJuggernautExcludeSlugs()
    const excludeSlugs = [...new Set([...spotlightSlugs, ...juggernautSlugs])]

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

        {/* Executive Compensation Featured Section - DEMO */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                  Executive Compensation Data
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Explore detailed salary breakdowns, stock awards, and total compensation packages for America's top executives
                </p>
              </div>

              {/* Feature Card */}
              <div className="dark-section bg-gradient-to-br from-[#082945] to-[#0a3d5c] rounded-xl shadow-2xl overflow-hidden border-2 border-[#c8ab3d]">
                <div className="p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left: Content */}
                    <div className="text-white">
                      <h3 className="text-3xl font-bold mb-4 text-white">
                        Highest Paid CEOs 2024
                      </h3>
                      <p className="text-gray-200 mb-6 leading-relaxed">
                        Access comprehensive compensation data for top executives including base salary, bonuses, stock awards, and total pay packages. Compare year-over-year changes and understand executive pay structures.
                      </p>
                      <ul className="space-y-3 mb-8">
                        <li className="flex items-center text-gray-200">
                          <span className="text-[#c8ab3d] mr-2">✓</span>
                          Detailed 5-year compensation history
                        </li>
                        <li className="flex items-center text-gray-200">
                          <span className="text-[#c8ab3d] mr-2">✓</span>
                          Complete salary breakdown by component
                        </li>
                        <li className="flex items-center text-gray-200">
                          <span className="text-[#c8ab3d] mr-2">✓</span>
                          Year-over-year trend analysis
                        </li>
                      </ul>
                      <Link
                        href="/executive-salaries"
                        className="inline-block px-8 py-4 bg-[#c8ab3d] text-[#082945] font-bold rounded-lg hover:bg-[#d6b745] transition-colors shadow-lg"
                      >
                        Explore Executive Salaries →
                      </Link>
                    </div>

                    {/* Right: Preview Stats */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                      <h4 className="text-white font-semibold mb-4">Top 3 Executives by Total Compensation</h4>
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[#c8ab3d] font-bold text-2xl">🏆 #1</span>
                            <span className="text-white font-bold">$848M</span>
                          </div>
                          <div className="text-gray-200 text-sm">Elon Musk, Tesla</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 font-bold text-xl">🥈 #2</span>
                            <span className="text-white font-bold">$226M</span>
                          </div>
                          <div className="text-gray-200 text-sm">Tim Cook, Apple</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 font-bold text-xl">🥉 #3</span>
                            <span className="text-white font-bold">$220M</span>
                          </div>
                          <div className="text-gray-200 text-sm">Sundar Pichai, Alphabet</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
