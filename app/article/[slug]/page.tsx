import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import AdPopup from '@/components/AdPopup'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'

// Dummy articles matching homepage
const dummyArticles: any = {
  'future-of-leadership-digital-world': {
    _id: 'dummy-1',
    title: 'The Future of Leadership in a Digital World',
    slug: { current: 'future-of-leadership-digital-world' },
    excerpt: 'How modern CEOs are adapting their leadership styles to navigate digital transformation and remote work environments.',
    author: { name: 'Sarah Johnson', slug: { current: 'sarah-johnson' }, position: 'Editor-in-Chief', image: { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' }, bio: 'An experienced writer and thought leader in the field of executive leadership and business strategy.' },
    categories: [{ title: 'Leadership', slug: { current: 'leadership' }, color: '#082945' }],
    tags: ['Digital Transformation', 'Remote Work', 'Executive Leadership'],
    readTime: 5,
    publishedAt: '2025-01-15',
    mainImage: { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', alt: 'Team of business leaders in a modern office setting' },
    body: []
  },
  'innovation-strategies-fortune-500': {
    _id: 'dummy-2',
    title: 'Innovation Strategies from Fortune 500 Companies',
    slug: { current: 'innovation-strategies-fortune-500' },
    excerpt: 'Exclusive insights into how top companies are fostering cultures of innovation and staying ahead of market disruption.',
    author: { name: 'Michael Chen', slug: { current: 'michael-chen' }, position: 'Senior Contributor', image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' }, bio: 'Technology and innovation expert covering Fortune 500 companies and emerging startups.' },
    categories: [{ title: 'Innovation', slug: { current: 'innovation' }, color: '#c8ab3d' }],
    tags: ['Fortune 500', 'Innovation Strategy', 'Corporate Culture'],
    readTime: 7,
    publishedAt: '2025-01-14',
    mainImage: { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop', alt: 'Innovative technology and collaboration' },
    body: []
  },
  'sustainable-business-practices-profit': {
    _id: 'dummy-3',
    title: 'Sustainable Business Practices That Drive Profit',
    slug: { current: 'sustainable-business-practices-profit' },
    excerpt: 'Discover how leading organizations are balancing environmental responsibility with financial success.',
    author: { name: 'Emma Williams', slug: { current: 'emma-williams' }, position: 'Sustainability Editor', image: { url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' }, bio: 'Sustainability advocate and business journalist focused on ESG and environmental responsibility.' },
    categories: [{ title: 'Sustainability', slug: { current: 'sustainability' }, color: '#22c55e' }],
    tags: ['ESG', 'Green Business', 'Sustainable Profit'],
    readTime: 6,
    publishedAt: '2025-01-13',
    mainImage: { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop', alt: 'Green sustainable business environment' },
    body: []
  }
}

async function getPost(slug: string): Promise<Post | null> {
  // Check if it's a dummy article first
  if (dummyArticles[slug]) {
    return dummyArticles[slug]
  }
  
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    "author": author->{name, slug, position, image, bio},
    mainImage,
    "categories": categories[]->{title, slug, color},
    readTime,
    body,
    seo
  }`
  
  return client.fetch(query, { slug })
}

async function getRelatedPosts(currentPostId: string): Promise<Post[]> {
  const query = `*[_type == "post" && _id != $currentPostId] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    "author": author->{name},
    mainImage,
    readTime
  }`
  
  return client.fetch(query, { currentPostId })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    notFound()
  }
  
  const relatedPosts = await getRelatedPosts(post._id)

  return (
    <>
      <AdPopup />
      <Navigation />
      
      <main className="bg-white">
        {/* Breadcrumb */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <Link href="/" className="hover:text-[#082945] transition-colors">Home</Link>
              <span>/</span>
              {post.categories && post.categories[0] && (
                <>
                  <Link 
                    href={`/category/${post.categories[0].slug.current}`}
                    className="hover:text-[#082945] transition-colors"
                  >
                    {post.categories[0].title}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-gray-900">{post.title}</span>
            </nav>
          </div>
        </div>

        <article className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  {/* Article Header */}
                  <div className="mb-8">
                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-gray-900 mb-6 leading-tight">
                      {post.title}
                    </h1>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-xl text-gray-600 leading-relaxed mb-8">
                        {post.excerpt}
                      </p>
                    )}
                    
                    {/* Featured Image */}
                    {post.mainImage && (
                      <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded-lg overflow-hidden">
                        <Image
                          src={post.mainImage.url || urlFor(post.mainImage).width(1200).height(800).url()}
                          alt={post.mainImage.alt || post.title}
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    )}
                  </div>

                  {/* Author & Social */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-8 border-b border-gray-200">
                    {/* Author */}
                    {post.author && (
                      <div className="flex items-center gap-3">
                        {post.author.image && (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={post.author.image.url || urlFor(post.author.image).width(100).height(100).url()}
                              alt={post.author.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">
                            By {post.author.name}
                          </p>
                          {(post.author.position || post.readTime) && (
                            <p className="text-xs text-gray-500">
                              {post.author.position && <span>{post.author.position}</span>}
                              {post.author.position && post.readTime && <span> • </span>}
                              {post.readTime && <span>{post.readTime} min read</span>}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Social Share */}
                    <div className="flex items-center gap-2">
                      <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label="Save article">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label="Share on Facebook">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label="Share on Twitter">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                        </svg>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label="Share on LinkedIn">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 transition-colors" aria-label="Share via email">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Article Body */}
                  <div className="prose prose-lg max-w-none">
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                      <p className="text-lg first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#082945]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                      </p>
                      
                      <p>
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                      </p>
                      
                      <p>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                      </p>
                      
                      <h2 id="path-excellence" className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">
                        The Path to Excellence
                      </h2>
                      
                      <p>
                        Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.
                      </p>
                      
                      <p>
                        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
                      </p>
                      
                      <blockquote className="border-l-4 border-[#c8ab3d] pl-6 my-8 italic text-xl text-gray-600">
                        "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus."
                      </blockquote>
                      
                      {/* In-Article Ad */}
                      <div className="my-12 bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
                        <p className="text-xs text-gray-500 uppercase tracking-wide text-center mb-4">Advertisement</p>
                        <div className="bg-white rounded-lg p-12 flex flex-col items-center justify-center" style={{ minHeight: '250px' }}>
                          <div className="text-center text-gray-400">
                            <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium mb-2">In-Article Advertisement</p>
                            <p className="text-sm">728 x 90 (Leaderboard) or 300 x 250</p>
                          </div>
                        </div>
                      </div>
                      
                      <h2 id="strategic-innovation" className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">
                        Strategic Innovation
                      </h2>
                      
                      <p>
                        Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.
                      </p>
                      
                      <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
                      </p>
                      
                      <h3 id="key-takeaways" className="text-2xl font-serif font-normal text-gray-900 mt-8 mb-4">
                        Key Takeaways
                      </h3>
                      
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
                        <li>Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</li>
                        <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris</li>
                        <li>Duis aute irure dolor in reprehenderit in voluptate velit esse</li>
                      </ul>
                      
                      <p className="mt-6">
                        Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
                      </p>
                      
                      <h2 id="looking-forward" className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">
                        Looking Forward
                      </h2>
                      
                      <p>
                        Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
                      </p>
                      
                      <p>
                        Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 space-y-8">
                    {/* Table of Contents */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                      <h3 className="font-serif text-base font-semibold text-gray-900 mb-4">
                        In This Article
                      </h3>
                      <nav className="space-y-2 text-sm font-sans">
                        <a href="#path-excellence" className="block text-gray-600 hover:text-[#082945] transition-colors py-1">
                          The Path to Excellence
                        </a>
                        <a href="#strategic-innovation" className="block text-gray-600 hover:text-[#082945] transition-colors py-1">
                          Strategic Innovation
                        </a>
                        <a href="#key-takeaways" className="block text-gray-600 hover:text-[#082945] transition-colors py-1">
                          Key Takeaways
                        </a>
                        <a href="#looking-forward" className="block text-gray-600 hover:text-[#082945] transition-colors py-1">
                          Looking Forward
                        </a>
                      </nav>
                    </div>
                    
                    {/* Ad Slot 1 */}
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Advertisement</p>
                        <div className="bg-white rounded p-8 flex items-center justify-center" style={{ minHeight: '250px' }}>
                          <div className="text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                            <p className="text-sm">300 x 250</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Author Bio */}
                    {post.author && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-serif text-base font-semibold text-gray-900 mb-4">
                          About the Author
                        </h3>
                        <div className="flex items-start gap-4 mb-4">
                          {post.author.image && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                src={post.author.image.url || urlFor(post.author.image).width(100).height(100).url()}
                                alt={post.author.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-sans font-bold text-gray-900 mb-1">{post.author.name}</h4>
                            {post.author.position && (
                              <p className="font-sans text-xs text-gray-500 mb-2">{post.author.position}</p>
                            )}
                          </div>
                        </div>
                        <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                          {post.author.bio || 'An experienced writer and thought leader in the field of executive leadership and business strategy.'}
                        </p>
                        <Link 
                          href={`/author/${post.author.slug?.current || post.author.name.toLowerCase().replace(/ /g, '-')}`}
                          className="font-sans text-sm font-medium text-[#082945] hover:text-[#0a3350] transition-colors"
                        >
                          More by {post.author.name} →
                        </Link>
                      </div>
                    )}
                    
                    {/* Related Articles */}
                    {relatedPosts.length > 0 && (
                      <div>
                        <h3 className="font-serif text-base font-semibold text-white bg-[#082945] px-4 py-3 mb-4">
                          Related Articles
                        </h3>
                        <div className="space-y-6">
                          {relatedPosts.map((relatedPost) => (
                            <Link
                              key={relatedPost._id}
                              href={`/article/${relatedPost.slug.current}`}
                              className="block group"
                            >
                              {relatedPost.mainImage && (
                                <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                                  <Image
                                    src={urlFor(relatedPost.mainImage).width(400).height(300).url()}
                                    alt={relatedPost.mainImage.alt || relatedPost.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <h4 className="text-lg font-serif font-normal text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-2">
                                {relatedPost.title}
                              </h4>
                              <div className="flex items-center justify-between text-sm text-gray-500 font-sans">
                                {relatedPost.author && <span>By {relatedPost.author.name}</span>}
                                {relatedPost.readTime && <span>{relatedPost.readTime} min read</span>}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Ad Slot 2 */}
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Advertisement</p>
                        <div className="bg-white rounded p-8 flex items-center justify-center" style={{ minHeight: '250px' }}>
                          <div className="text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                            <p className="text-sm">300 x 250</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Trending Now */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-serif text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#c8ab3d]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        Trending Now
                      </h3>
                      <div className="space-y-4">
                        <Link href="#" className="block group">
                          <div className="flex gap-3">
                            <span className="text-2xl font-bold text-[#c8ab3d] flex-shrink-0">1</span>
                            <div>
                              <h4 className="font-sans text-sm font-medium text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-1">
                                AI Revolution in Executive Decision Making
                              </h4>
                              <p className="font-sans text-xs text-gray-500">15.2K views</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="#" className="block group">
                          <div className="flex gap-3">
                            <span className="text-2xl font-bold text-[#c8ab3d] flex-shrink-0">2</span>
                            <div>
                              <h4 className="font-sans text-sm font-medium text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-1">
                                Women CEOs Breaking Tech Barriers
                              </h4>
                              <p className="font-sans text-xs text-gray-500">12.8K views</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="#" className="block group">
                          <div className="flex gap-3">
                            <span className="text-2xl font-bold text-[#c8ab3d] flex-shrink-0">3</span>
                            <div>
                              <h4 className="font-sans text-sm font-medium text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-1">
                                Sustainable Practices Drive Profit
                              </h4>
                              <p className="font-sans text-xs text-gray-500">11.4K views</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="#" className="block group">
                          <div className="flex gap-3">
                            <span className="text-2xl font-bold text-[#c8ab3d] flex-shrink-0">4</span>
                            <div>
                              <h4 className="font-sans text-sm font-medium text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-1">
                                The New Era of Remote Leadership
                              </h4>
                              <p className="font-sans text-xs text-gray-500">9.7K views</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="#" className="block group">
                          <div className="flex gap-3">
                            <span className="text-2xl font-bold text-[#c8ab3d] flex-shrink-0">5</span>
                            <div>
                              <h4 className="font-sans text-sm font-medium text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-1">
                                Innovation Strategies from Fortune 500
                              </h4>
                              <p className="font-sans text-xs text-gray-500">8.9K views</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  )
}
