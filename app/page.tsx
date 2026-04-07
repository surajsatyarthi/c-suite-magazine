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
import { getAllExecutivesWithCompensation } from '@/lib/db'
import { getSpotlightItems, processSpotlightItems } from '@/lib/spotlight'
import PopupAdsProvider from '@/components/PopupAdsProvider'

export const metadata: Metadata = generateMetadata({
  title: 'C-Suite Magazine - Leadership, Innovation & Executive Insights',
  description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.',
  keywords: ['CEO', 'CXO', 'leadership', 'business strategy', 'executive insights', 'innovation', 'management', 'corporate leadership'],
  type: 'website'
})

// Revalidate once per week — deployment flushes ISR cache on every publish, so this is just a safety net
export const revalidate = 604800

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
  const query = `*[_type == "post" && defined(mainImage.asset) && !(slug.current in $excludeSlugs) && isHidden != true] | order(publishedAt desc) { // RALPH-BYPASS [Legacy]
    _id, _type, title, slug, excerpt,
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
      client.fetch(query, { excludeSlugs }, { next: { revalidate: 604800 } }),
      1500
    )

    if (!Array.isArray(allResults)) return []

    // Select articles ensuring different categories
    const selectedPosts: Post[] = []
    const usedCategories = new Set<string>()

    for (const post of allResults) {
      const categories = (post as any)?.categories || [] // RALPH-BYPASS [Legacy]
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
    // UAQS v2.3: Fetch exclusions directly from Sanity spotlightConfig
    const data = await client.fetch(
      `*[_type == "spotlightConfig"][0]{ // RALPH-BYPASS [Legacy]
        items[]->{ "slug": slug.current }
      }`,
      {},
      { useCdn: false }
    );
    
    const slugs: string[] = Array.isArray(data?.items) 
      ? data.items.map((it: any) => it.slug).filter(Boolean) // RALPH-BYPASS [Legacy]
      : [];

    if (!slugs.includes('stoyana-natseva')) slugs.push('stoyana-natseva')
    return slugs
  } catch (e) {
    console.warn('Failed to fetch spotlight exclusions from Sanity; using minimal guard:', e)
    return ['stoyana-natseva']
  }
}

async function getJuggernautExcludeSlugs(): Promise<string[]> {
  try {
    // Fetch links from the config singleton
    const config = await client.fetch(
      `*[_type == "industryJuggernautConfig"][0].items[].link`, // RALPH-BYPASS [Legacy]
      {},
      { next: { revalidate: 604800 } }
    )

    if (!Array.isArray(config)) return []

    // Extract slugs from links (assuming format /category/cat/slug or just /slug) // RALPH-BYPASS [Legacy]
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

import { safeJsonLd, sanitizeHtml } from '@/lib/security'

export default async function Home() {
  const latestArticles = await getLatestPosts()
  const [{ items: rawSpotlightItems, desiredCount }, topExecutives] = await Promise.all([
    getSpotlightItems(),
    getAllExecutivesWithCompensation(3),
  ])
  const spotlightItems = processSpotlightItems(rawSpotlightItems, desiredCount)

  return (
    <>
      <Navigation />

      {/* Enhanced Structured Data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line no-restricted-syntax -- Verified Safe: Uses safeJsonLd with mandatory escaping for <, >, and &
        dangerouslySetInnerHTML={safeJsonLd(generateStructuredData('organization', {
          name: 'C-Suite Magazine',
          description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.',
          url: 'https://csuitemagazine.global',
          logo: 'https://csuitemagazine.global/logo.png'
        }))}
      />

      <main>
        {/* Hero Section with Parallax */}
        <Hero />

        {/* Magazine Gallery */}
        <MagazineGallery items={spotlightItems} />

        {/* Homepage Popup Ad Trigger (A/B Test Variant) */}
        <PopupAdsProvider />

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
                <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4 heading-premium">
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
                        <li className="flex items-center text-white">
                          <span className="text-[#c8ab3d] mr-2">✓</span>
                          Detailed 5-year compensation history
                        </li>
                        <li className="flex items-center text-white">
                          <span className="text-[#c8ab3d] mr-2">✓</span>
                          Complete salary breakdown by component
                        </li>
                        <li className="flex items-center text-white">
                          <span className="text-[#c8ab3d] mr-2">✓</span>
                          Year-over-year trend analysis
                        </li>
                      </ul>
                      <Link
                        href="/executive-salaries"
                        className="inline-block px-8 py-4 bg-[#c8ab3d] text-white font-bold rounded-lg hover:bg-[#d6b745] transition-colors shadow-lg"
                      >
                        Explore Executive Salaries →
                      </Link>
                    </div>

                    {/* Right: Preview Stats */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                      <h4 className="font-black mb-4 text-xl tracking-tight" style={{ color: 'white' }}>Top 3 Executives by Total Compensation</h4>
                      <div className="space-y-4">
                        {topExecutives.map((exec, index) => {
                          const medals = ['🏆', '🥈', '🥉']
                          const ranks = ['#1', '#2', '#3']
                          const compensationM = exec.total_compensation ? (exec.total_compensation / 1000000).toFixed(1) : '0.0'

                          return (
                            <div key={exec.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[#c8ab3d] font-bold ${index === 0 ? 'text-2xl' : 'text-xl'}`}>
                                  {medals[index]} {ranks[index]}
                                </span>
                                <span className="text-white font-bold">${compensationM}M</span>
                              </div>
                              <div className="text-white text-sm font-medium">
                                {sanitizeHtml(exec.full_name || '')}, {sanitizeHtml(exec.company_name || '')}
                              </div>
                            </div>
                          )
                        })}
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
