import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import CEOSpotlight from '@/components/CEOSpotlight'
import MagazineGallery from '@/components/MagazineGallery'
import FeaturedCXOs from '@/components/FeaturedCXOs'
import LatestInsights from '@/components/LatestInsights'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'
import type { Metadata } from 'next'
import { generateMetadata, generateStructuredData } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: 'C-Suite Magazine - Leadership, Innovation & Executive Insights',
  description: 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.',
  keywords: ['CEO', 'CXO', 'leadership', 'business strategy', 'executive insights', 'innovation', 'management', 'corporate leadership'],
  type: 'website'
})

async function getFeaturedPosts(): Promise<Post[]> {
  const query = `*[_type == "post" && isFeatured == true] | order(publishedAt desc) [0...12] {
    _id,
    title,
    slug,
    excerpt,
    "author": author->{name, slug, position, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    isFeatured,
    readTime,
    publishedAt
  }`
  try {
    return await client.fetch(query)
  } catch (e) {
    return []
  }
}

async function getLatestPosts(): Promise<Post[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) [0...6] {
    _id,
    title,
    slug,
    excerpt,
    "author": author->{name, slug, position, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    readTime,
    publishedAt
  }`
  try {
    return await client.fetch(query)
  } catch (e) {
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

// Dummy articles for when no content exists
const dummyArticles = [
  {
    _id: 'dummy-1',
    title: 'The Future of Leadership in a Digital World',
    slug: { current: 'future-of-leadership-digital-world' },
    excerpt: 'How modern CEOs are adapting their leadership styles to navigate digital transformation and remote work environments.',
    author: { _id: 'author-dummy-1', name: 'Sarah Johnson', slug: { current: '#' }, position: 'Editor-in-Chief', image: { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' } },
    categories: [{ _id: 'cat-dummy-1', title: 'Leadership', slug: { current: 'leadership' }, color: '#082945' }],
    tags: ['Digital Transformation', 'Remote Work', 'Executive Leadership'],
    readTime: 5,
    publishedAt: '2025-01-15',
    mainImage: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', alt: 'Team of business leaders in a modern office setting' },
    views: 2800000,
    body: []
  },
  {
    _id: 'dummy-2',
    title: 'Innovation Strategies from Fortune 500 Companies',
    slug: { current: 'innovation-strategies-fortune-500' },
    excerpt: 'Exclusive insights into how top companies are fostering cultures of innovation and staying ahead of market disruption.',
    author: { _id: 'author-dummy-2', name: 'Michael Chen', slug: { current: '#' }, position: 'Senior Contributor', image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' } },
    categories: [{ _id: 'cat-dummy-2', title: 'Innovation', slug: { current: 'innovation' }, color: '#c8ab3d' }],
    tags: ['Fortune 500', 'Innovation Strategy', 'Corporate Culture'],
    readTime: 7,
    publishedAt: '2025-01-14',
    mainImage: { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop', alt: 'Innovative technology and collaboration' },
    views: 2400000,
    body: []
  },
  {
    _id: 'dummy-3',
    title: 'Sustainable Business Practices That Drive Profit',
    slug: { current: 'sustainable-business-practices-profit' },
    excerpt: 'Discover how leading organizations are balancing environmental responsibility with financial success.',
    author: { _id: 'author-dummy-3', name: 'Emma Williams', slug: { current: '#' }, position: 'Sustainability Editor', image: { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' } },
    categories: [{ _id: 'cat-dummy-3', title: 'Sustainability', slug: { current: 'sustainability' }, color: '#22c55e' }],
    tags: ['ESG', 'Green Business', 'Sustainable Profit'],
    readTime: 6,
    publishedAt: '2025-01-13',
    mainImage: { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop', alt: 'Green sustainable business environment' },
    views: 2100000,
    body: []
  },
  {
    _id: 'dummy-4',
    title: 'Women CEOs Breaking Barriers in Tech',
    slug: { current: 'women-ceos-breaking-barriers-tech' },
    excerpt: 'Profiles of remarkable women leaders who are transforming the technology industry and inspiring the next generation.',
    author: { _id: 'author-dummy-4', name: 'Lisa Anderson', slug: { current: '#' }, position: 'Contributing Writer', image: { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop' } },
    categories: [{ _id: 'cat-dummy-4', title: 'CEO Woman', slug: { current: 'ceo-woman' }, color: '#ec4899' }],
    tags: ['Women in Tech', 'Female CEOs', 'Glass Ceiling'],
    readTime: 8,
    publishedAt: '2025-01-12',
    mainImage: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop', alt: 'Professional woman CEO in tech industry' },
    views: 1800000,
    body: []
  },
  {
    _id: 'dummy-5',
    title: 'Navigating Economic Uncertainty: A CFO Guide',
    slug: { current: 'navigating-economic-uncertainty-cfo-guide' },
    excerpt: 'Financial strategies and risk management techniques for maintaining stability during volatile economic periods.',
    author: { _id: 'author-dummy-5', name: 'David Martinez', slug: { current: '#' }, position: 'Finance Editor', image: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' } },
    categories: [{ _id: 'cat-dummy-5', title: 'Money & Finance', slug: { current: 'money-finance' }, color: '#3b82f6' }],
    tags: ['CFO Strategy', 'Risk Management', 'Economic Uncertainty'],
    readTime: 9,
    publishedAt: '2025-01-11',
    mainImage: { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', alt: 'Financial charts and business analytics' },
    views: 1600000,
    body: []
  },
  {
    _id: 'dummy-6',
    title: 'The Rise of AI in Executive Decision Making',
    slug: { current: 'rise-of-ai-executive-decision-making' },
    excerpt: 'How artificial intelligence and machine learning are revolutionizing strategic planning and business intelligence.',
    author: { _id: 'author-dummy-6', name: 'Alex Thompson', slug: { current: '#' }, position: 'Technology Reporter', image: { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' } },
    categories: [{ _id: 'cat-dummy-6', title: 'Technology', slug: { current: 'technology' }, color: '#8b5cf6' }],
    tags: ['Artificial Intelligence', 'Machine Learning', 'Business Intelligence'],
    readTime: 6,
    publishedAt: '2025-01-10',
    mainImage: { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', alt: 'AI and artificial intelligence technology' },
    views: 1300000,
    body: []
  },
  {
    _id: 'dummy-7',
    title: 'Global Supply Chain Resilience Strategies',
    slug: { current: 'global-supply-chain-resilience' },
    excerpt: 'How top executives are building robust supply chains that can withstand global disruptions and economic volatility.',
    author: { _id: 'author-dummy-7', name: 'Rachel Kim', slug: { current: '#' }, position: 'Operations Editor', image: { url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop' } },
    categories: [{ _id: 'cat-dummy-7', title: 'Operations', slug: { current: 'operations' }, color: '#f59e0b' }],
    tags: ['Supply Chain', 'Risk Management', 'Global Operations'],
    readTime: 7,
    publishedAt: '2025-01-09',
    mainImage: { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop', alt: 'Global supply chain and logistics operations' },
    views: 1100000,
    body: []
  }
]

export default async function Home() {
  const [featuredPosts, latestPosts] = await Promise.all([
    getFeaturedPosts(),
    getLatestPosts()
  ])

  // Ensure we have enough articles for Featured CXOs (12 total)
  const displayFeatured = featuredPosts.slice(0, 12)

  // Provide enough Latest Insights for Read More growth
  const latestArticles = latestPosts

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

        {/* CEO Spotlight Section */}
        <CEOSpotlight />

        {/* Magazine Gallery */}
        <MagazineGallery />

        {/* Featured CXOs */}
        <FeaturedCXOs articles={displayFeatured} />

        {/* Latest Insights */}
        <LatestInsights articles={latestArticles} />

      </main>

      <Footer />
    </>
  )
}
