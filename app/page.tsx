import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ParallaxHero from '@/components/ParallaxHero'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'

async function getFeaturedPosts(): Promise<Post[]> {
  const query = `*[_type == "post" && isFeatured == true] | order(publishedAt desc) [0...3] {
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
  
  return client.fetch(query)
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
  
  return client.fetch(query)
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
    author: { name: 'Sarah Johnson', slug: { current: '#' }, position: 'Editor-in-Chief', image: { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' } },
    categories: [{ title: 'Leadership', slug: { current: 'leadership' }, color: '#082945' }],
    tags: ['Digital Transformation', 'Remote Work', 'Executive Leadership'],
    readTime: 5,
    publishedAt: '2025-01-15',
    mainImage: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', alt: 'Team of business leaders in a modern office setting' },
    views: 15200
  },
  {
    _id: 'dummy-2',
    title: 'Innovation Strategies from Fortune 500 Companies',
    slug: { current: 'innovation-strategies-fortune-500' },
    excerpt: 'Exclusive insights into how top companies are fostering cultures of innovation and staying ahead of market disruption.',
    author: { name: 'Michael Chen', slug: { current: '#' }, position: 'Senior Contributor', image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' } },
    categories: [{ title: 'Innovation', slug: { current: 'innovation' }, color: '#c8ab3d' }],
    tags: ['Fortune 500', 'Innovation Strategy', 'Corporate Culture'],
    readTime: 7,
    publishedAt: '2025-01-14',
    mainImage: { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop', alt: 'Innovative technology and collaboration' },
    views: 12800
  },
  {
    _id: 'dummy-3',
    title: 'Sustainable Business Practices That Drive Profit',
    slug: { current: 'sustainable-business-practices-profit' },
    excerpt: 'Discover how leading organizations are balancing environmental responsibility with financial success.',
    author: { name: 'Emma Williams', slug: { current: '#' }, position: 'Sustainability Editor', image: { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' } },
    categories: [{ title: 'Sustainability', slug: { current: 'sustainability' }, color: '#22c55e' }],
    tags: ['ESG', 'Green Business', 'Sustainable Profit'],
    readTime: 6,
    publishedAt: '2025-01-13',
    mainImage: { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop', alt: 'Green sustainable business environment' },
    views: 11400
  },
  {
    _id: 'dummy-4',
    title: 'Women CEOs Breaking Barriers in Tech',
    slug: { current: '#' },
    excerpt: 'Profiles of remarkable women leaders who are transforming the technology industry and inspiring the next generation.',
    author: { name: 'Lisa Anderson', slug: { current: '#' }, position: 'Contributing Writer', image: { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop' } },
    categories: [{ title: 'CEO Woman', slug: { current: 'ceo-woman' }, color: '#ec4899' }],
    tags: ['Women in Tech', 'Female CEOs', 'Glass Ceiling'],
    readTime: 8,
    publishedAt: '2025-01-12',
    mainImage: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop', alt: 'Professional woman CEO in tech industry' },
    views: 9700
  },
  {
    _id: 'dummy-5',
    title: 'Navigating Economic Uncertainty: A CFO Guide',
    slug: { current: '#' },
    excerpt: 'Financial strategies and risk management techniques for maintaining stability during volatile economic periods.',
    author: { name: 'David Martinez', slug: { current: '#' }, position: 'Finance Editor', image: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' } },
    categories: [{ title: 'Money & Finance', slug: { current: 'money-finance' }, color: '#3b82f6' }],
    tags: ['CFO Strategy', 'Risk Management', 'Economic Uncertainty'],
    readTime: 9,
    publishedAt: '2025-01-11',
    mainImage: { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop', alt: 'Financial charts and business analytics' },
    views: 8500
  },
  {
    _id: 'dummy-6',
    title: 'The Rise of AI in Executive Decision Making',
    slug: { current: '#' },
    excerpt: 'How artificial intelligence and machine learning are revolutionizing strategic planning and business intelligence.',
    author: { name: 'Alex Thompson', slug: { current: '#' }, position: 'Technology Reporter', image: { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' } },
    categories: [{ title: 'Technology', slug: { current: 'technology' }, color: '#8b5cf6' }],
    tags: ['Artificial Intelligence', 'Machine Learning', 'Business Intelligence'],
    readTime: 6,
    publishedAt: '2025-01-10',
    mainImage: { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop', alt: 'AI and artificial intelligence technology' },
    views: 7200
  }
]

export default async function Home() {
  const featuredPosts = await getFeaturedPosts()
  const latestPosts = await getLatestPosts()
  
  // Use dummy data if no real content exists
  const displayFeatured = featuredPosts.length > 0 ? featuredPosts : dummyArticles.slice(0, 3)
  const displayLatest = latestPosts.length > 0 ? latestPosts : dummyArticles

  return (
    <>
      <Navigation />
      
      <main>
        {/* Hero Section with Parallax */}
        <ParallaxHero />

        {/* Featured Articles */}
        {displayFeatured.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-4xl font-serif font-black text-gray-900">Featured Stories</h3>
                <span className="text-[#c8ab3d] font-semibold">★ Editor's Choice</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayFeatured.map((post) => (
                  <Link
                    key={post._id}
                    href={`/article/${post.slug.current}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                      {post.mainImage?.url ? (
                        <Image
                          src={post.mainImage.url || urlFor(post.mainImage).width(600).height(400).url()}
                          alt={post.mainImage.alt || post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : post.mainImage ? (
                        <Image
                          src={urlFor(post.mainImage).width(600).height(400).url()}
                          alt={post.mainImage.alt || post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {post.categories && post.categories[0] && (
                        <span
                          className="category-badge-flash absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded"
                          style={{ backgroundColor: post.categories[0].color || '#c8ab3d' }}
                        >
                          {post.categories[0].title}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-[#082945] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {post.tags.slice(0, 2).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{post.author?.name}</span>
                        <div className="flex items-center gap-3">
                          {post.readTime && <span>{post.readTime} min read</span>}
                          {post.views && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {(post.views / 1000).toFixed(1)}K
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-4xl font-serif font-black text-gray-900 mb-10">Latest Insights</h3>
            
            {displayLatest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayLatest.map((post) => (
                  <Link
                    key={post._id}
                    href={`/article/${post.slug.current}`}
                    className="group"
                  >
                    <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                        {post.mainImage?.url ? (
                          <Image
                            src={post.mainImage.url || urlFor(post.mainImage).width(500).height(350).url()}
                            alt={post.mainImage.alt || post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : post.mainImage ? (
                          <Image
                            src={urlFor(post.mainImage).width(500).height(350).url()}
                            alt={post.mainImage.alt || post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {post.categories && post.categories[0] && (
                          <span
                            className="category-badge-flash absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded"
                            style={{ backgroundColor: post.categories[0].color || '#c8ab3d' }}
                          >
                            {post.categories[0].title}
                          </span>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {post.tags.slice(0, 2).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                          <span className="font-medium">{post.author?.name}</span>
                          <div className="flex items-center gap-2">
                            {post.readTime && <span>{post.readTime} min</span>}
                            {post.views && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {(post.views / 1000).toFixed(1)}K
                              </span>
                            )}
                          </div>
                        </div>
                        {post.publishedAt && (
                          <time className="text-xs text-gray-400 mt-2 block">
                            {formatDate(post.publishedAt)}
                          </time>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-12">
              <button 
                disabled
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-400 cursor-not-allowed"
              >
                Previous
              </button>
              
              <button className="px-4 py-2 rounded-md bg-[#082945] text-white font-medium">
                1
              </button>
              <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                3
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                10
              </button>
              
              <button className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
