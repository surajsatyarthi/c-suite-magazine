import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'

// Dummy author data
const dummyAuthors: any = {
  'sarah-johnson': {
    name: 'Sarah Johnson',
    slug: 'sarah-johnson',
    position: 'Editor-in-Chief',
    bio: 'An experienced writer and thought leader in the field of executive leadership and business strategy. Sarah has over 15 years of experience covering C-suite topics and has interviewed hundreds of Fortune 500 CEOs.',
    image: { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
    social: {
      twitter: 'https://twitter.com/sarahjohnson',
      linkedin: 'https://linkedin.com/in/sarahjohnson',
      email: 'sarah.johnson@csuitemag.com'
    },
    articles: [
      {
        _id: 'dummy-1',
        title: 'The Future of Leadership in a Digital World',
        slug: { current: 'future-of-leadership-digital-world' },
        excerpt: 'How modern CEOs are adapting their leadership styles to navigate digital transformation.',
        categories: [{ title: 'Leadership', slug: { current: 'leadership' }, color: '#082945' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-15',
        readTime: 5,
        views: 15200
      },
      {
        _id: 'dummy-1b',
        title: 'Building Resilient Organizations in Uncertain Times',
        slug: { current: 'building-resilient-organizations' },
        excerpt: 'Strategies for creating organizational resilience and adaptability in rapidly changing business environments.',
        categories: [{ title: 'Strategy', slug: { current: 'strategy' }, color: '#0ea5e9' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-10',
        readTime: 6,
        views: 13400
      },
      {
        _id: 'dummy-1c',
        title: 'The Art of Strategic Decision Making',
        slug: { current: 'art-strategic-decision-making' },
        excerpt: 'Learn how top executives make critical business decisions under pressure and uncertainty.',
        categories: [{ title: 'Leadership', slug: { current: 'leadership' }, color: '#082945' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-05',
        readTime: 7,
        views: 18600
      },
      {
        _id: 'dummy-1d',
        title: 'Empowering Teams Through Distributed Leadership',
        slug: { current: 'empowering-teams-distributed-leadership' },
        excerpt: 'Why the most successful companies are moving away from top-down hierarchies.',
        categories: [{ title: 'Management', slug: { current: 'management' }, color: '#8b5cf6' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop' },
        publishedAt: '2024-12-28',
        readTime: 5,
        views: 11200
      }
    ]
  },
  'michael-chen': {
    name: 'Michael Chen',
    slug: 'michael-chen',
    position: 'Senior Contributor',
    bio: 'Technology and innovation expert covering Fortune 500 companies and emerging startups. Michael specializes in corporate innovation strategies and digital disruption.',
    image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    social: {
      twitter: 'https://twitter.com/michaelchen',
      linkedin: 'https://linkedin.com/in/michaelchen',
      email: 'michael.chen@csuitemag.com'
    },
    articles: [
      {
        _id: 'dummy-2',
        title: 'Innovation Strategies from Fortune 500 Companies',
        slug: { current: 'innovation-strategies-fortune-500' },
        excerpt: 'Exclusive insights into how top companies are fostering cultures of innovation.',
        categories: [{ title: 'Innovation', slug: { current: 'innovation' }, color: '#c8ab3d' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-14',
        readTime: 7,
        views: 12800
      },
      {
        _id: 'dummy-2b',
        title: 'AI and the Future of Business Operations',
        slug: { current: 'ai-future-business-operations' },
        excerpt: 'How artificial intelligence is transforming every aspect of modern enterprise operations.',
        categories: [{ title: 'Technology', slug: { current: 'technology' }, color: '#06b6d4' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-08',
        readTime: 8,
        views: 19500
      },
      {
        _id: 'dummy-2c',
        title: 'Cybersecurity in the C-Suite: What Leaders Need to Know',
        slug: { current: 'cybersecurity-c-suite-leaders' },
        excerpt: 'Essential security considerations for executives in an increasingly digital business landscape.',
        categories: [{ title: 'Technology', slug: { current: 'technology' }, color: '#06b6d4' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-02',
        readTime: 6,
        views: 14700
      },
      {
        _id: 'dummy-2d',
        title: 'The Rise of Corporate Innovation Labs',
        slug: { current: 'rise-corporate-innovation-labs' },
        excerpt: 'Why major corporations are investing billions in dedicated innovation spaces and teams.',
        categories: [{ title: 'Innovation', slug: { current: 'innovation' }, color: '#c8ab3d' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop' },
        publishedAt: '2024-12-25',
        readTime: 7,
        views: 16300
      },
      {
        _id: 'dummy-2e',
        title: 'Cloud Migration: Lessons from Industry Leaders',
        slug: { current: 'cloud-migration-lessons-leaders' },
        excerpt: 'Best practices and common pitfalls in enterprise cloud transformation initiatives.',
        categories: [{ title: 'Technology', slug: { current: 'technology' }, color: '#06b6d4' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop' },
        publishedAt: '2024-12-20',
        readTime: 9,
        views: 13900
      }
    ]
  },
  'emma-williams': {
    name: 'Emma Williams',
    slug: 'emma-williams',
    position: 'Sustainability Editor',
    bio: 'Sustainability advocate and business journalist focused on ESG and environmental responsibility. Emma helps executives understand the business case for sustainability.',
    image: { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
    social: {
      twitter: 'https://twitter.com/emmawilliams',
      linkedin: 'https://linkedin.com/in/emmawilliams',
      email: 'emma.williams@csuitemag.com'
    },
    articles: [
      {
        _id: 'dummy-3',
        title: 'Sustainable Business Practices That Drive Profit',
        slug: { current: 'sustainable-business-practices-profit' },
        excerpt: 'Discover how leading organizations are balancing environmental responsibility with financial success.',
        categories: [{ title: 'Sustainability', slug: { current: 'sustainability' }, color: '#22c55e' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-13',
        readTime: 6,
        views: 11400
      },
      {
        _id: 'dummy-3b',
        title: 'The Business Case for Carbon Neutrality',
        slug: { current: 'business-case-carbon-neutrality' },
        excerpt: 'Why forward-thinking companies are racing to achieve net-zero emissions ahead of regulations.',
        categories: [{ title: 'Sustainability', slug: { current: 'sustainability' }, color: '#22c55e' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-07',
        readTime: 7,
        views: 15800
      },
      {
        _id: 'dummy-3c',
        title: 'ESG Reporting: Beyond Compliance',
        slug: { current: 'esg-reporting-beyond-compliance' },
        excerpt: 'How sophisticated ESG strategies are becoming competitive advantages in the marketplace.',
        categories: [{ title: 'Finance', slug: { current: 'finance' }, color: '#f59e0b' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop' },
        publishedAt: '2025-01-01',
        readTime: 8,
        views: 12100
      },
      {
        _id: 'dummy-3d',
        title: 'Supply Chain Sustainability in Global Markets',
        slug: { current: 'supply-chain-sustainability-global' },
        excerpt: 'Transforming supply chains to meet environmental goals without sacrificing efficiency.',
        categories: [{ title: 'Operations', slug: { current: 'operations' }, color: '#64748b' }],
        mainImage: { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop' },
        publishedAt: '2024-12-27',
        readTime: 6,
        views: 10900
      }
    ]
  }
}

async function getAuthor(slug: string) {
  // Check dummy authors first
  if (dummyAuthors[slug]) {
    return dummyAuthors[slug]
  }

  // Fetch from Sanity
  const query = `*[_type == "author" && slug.current == $slug][0] {
    name,
    slug,
    position,
    bio,
    image,
    social,
    "articles": *[_type == "post" && author._ref == ^._id] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      "categories": categories[]->{title, slug, color},
      publishedAt,
      readTime
    }
  }`
  
  return client.fetch(query, { slug })
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)

  if (!author) {
    notFound()
  }

  return (
    <>
      <Navigation />
      
      <main className="bg-white">
        {/* Author Header */}
        <section className="py-16 bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Author Image */}
                {author.image && (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-white/20">
                    <Image
                      src={author.image.url}
                      alt={author.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
                
                {/* Author Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                    {author.name}
                  </h1>
                  {author.position && (
                    <p className="text-xl text-[#c8ab3d] mb-4 font-medium">
                      {author.position}
                    </p>
                  )}
                  {author.bio && (
                    <p className="text-lg text-gray-300 leading-relaxed mb-6">
                      {author.bio}
                    </p>
                  )}
                  
                  {/* Social Links */}
                  {author.social && (
                    <div className="flex gap-4 justify-center md:justify-start">
                      {author.social.twitter && (
                        <a
                          href={author.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                          aria-label="Twitter"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                          </svg>
                        </a>
                      )}
                      {author.social.linkedin && (
                        <a
                          href={author.social.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                          aria-label="LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                      {author.social.email && (
                        <a
                          href={`mailto:${author.social.email}`}
                          className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                          aria-label="Email"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles by Author */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                Articles by {author.name}
              </h2>
              <p className="text-gray-600 mb-10">
                {author.articles?.length || 0} {author.articles?.length === 1 ? 'article' : 'articles'} published
              </p>

              {author.articles && author.articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {author.articles.map((article: any) => (
                    <Link
                      key={article._id}
                      href={`/article/${article.slug.current}`}
                      className="group"
                    >
                      <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                          {article.mainImage?.url ? (
                            <Image
                              src={article.mainImage.url}
                              alt={article.title}
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
                          {article.categories && article.categories[0] && (
                            <span
                              className="category-badge-flash absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded"
                              style={{ backgroundColor: article.categories[0].color || '#c8ab3d' }}
                            >
                              {article.categories[0].title}
                            </span>
                          )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                            {article.publishedAt && (
                              <time>{formatDate(article.publishedAt)}</time>
                            )}
                            <div className="flex items-center gap-2">
                              {article.readTime && <span>{article.readTime} min</span>}
                              {article.views && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  {(article.views / 1000).toFixed(1)}K
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-lg">No articles published yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
