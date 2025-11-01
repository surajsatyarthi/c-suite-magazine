import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import OptimizedImage from '@/components/OptimizedImage'
import dynamic from 'next/dynamic'
const ArticleProgress = dynamic(() => import('@/components/ArticleProgress'))
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
// dynamic already imported above
import Ad from '@/components/Ad'
import SocialShare from '@/components/SocialShare'
import PortableBody from '@/components/PortableBody'
const ViewTracker = dynamic(() => import('@/components/ViewTracker'))
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo'

// Removed local dummy articles. Articles now rely solely on Sanity content.

async function getPost(slug: string): Promise<Post | null> {
  // Fetch exclusively from Sanity
  
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
  
  try {
    return await client.fetch(query, { slug })
  } catch (e) {
    return null
  }
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
  
  try {
    return await client.fetch(query, { currentPostId })
  } catch (e) {
    return []
  }
}

export const revalidate = 600

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    notFound()
  }
  
  const relatedPosts = await getRelatedPosts(post._id)
  const bodyText: string = typeof (post as any)?.body === 'string' ? (post as any).body : ''

  const slugify = (s: string) => String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const headings = Array.isArray((post as any)?.body)
    ? ((post as any).body as any[])
        .filter(b => ['h2','h3'].includes(b?.style))
        .map(b => {
          const text = (b?.children || []).map((c: any) => String(c?.text || '')).join(' ').trim()
          return { id: slugify(text), text, level: b?.style }
        })
    : []

  const wordCount = Array.isArray((post as any)?.body)
    ? ((post as any).body as any[]).reduce((acc, b) => acc + (b?.children || []).reduce((a: number, c: any) => a + String(c?.text || '').split(/\s+/).filter(Boolean).length, 0), 0)
    : (bodyText ? bodyText.split(/\s+/).filter(Boolean).length : 0)

  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <>
      {/* Track a view for this article */}
      <ViewTracker slug={slug} />
      <AdPopup />
      <Navigation />
      
      <main className="bg-white">
        <ArticleProgress />
        {/* Enhanced Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData('article', {
            title: post.title,
            description: post.excerpt || post.body?.[0]?.children?.[0]?.text?.substring(0, 160) + '...',
            image: post.mainImage ? (post.mainImage.url || urlFor(post.mainImage).url()) : undefined,
            publishedTime: post.publishedAt,
            author: post.author?.name,
            url: `https://csuitemagazine.global/article/${post.slug?.current}`,
            wordCount,
            readTime
          })),
        }}
      />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            ...(post.categories && post.categories[0]
              ? [{ label: post.categories[0].title, href: `/category/${post.categories[0].slug.current}` }]
              : []),
            { label: post.title },
          ]}
        />

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
                        <OptimizedImage
                          src={post.mainImage.url || urlFor(post.mainImage).width(1200).height(800).url()}
                          alt={post.mainImage.alt || post.title}
                          fill
                          className="object-cover"
                          priority
                          sizes="100vw"
                          quality={90}
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
                            <OptimizedImage
                              src={post.author.image.url || urlFor(post.author.image).width(100).height(100).url()}
                              alt={post.author.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">By {post.author.name}</span>
                          {post.author.position && <span className="text-xs text-gray-500">{post.author.position}</span>}
                          {(post.author.position || post.views) && post.views && <span className="text-xs text-gray-500">•</span>}
                          {post.views && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {(post.views / 1000000).toFixed(1)}M views
                            </span>
                          )}
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500" aria-label={`Estimated read time ${readTime} minutes`}>
                            {readTime} min read
                          </span>
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
                      {/* WhatsApp */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + ((process.env.NEXT_PUBLIC_SITE_URL || 'https://csuitemag.com') + '/article/' + post.slug.current))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-[#25D366] rounded hover:bg-[#1EBE5A] transition-colors"
                        aria-label="Share on WhatsApp"
                      >
                        <Image
                          src="https://api.iconify.design/simple-icons/whatsapp.svg?color=white"
                          alt="WhatsApp"
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      </a>
                      {/* LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL || 'https://csuitemag.com') + '/article/' + post.slug.current)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-[#0A66C2] rounded hover:bg-[#094D92] transition-colors"
                        aria-label="Share on LinkedIn"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      {/* Email */}
                      <a
                        href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL || 'https://csuitemag.com') + '/article/' + post.slug.current)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-[#EA4335] rounded hover:bg-[#D33426] transition-colors"
                        aria-label="Share via email"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                      {/* Twitter */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL || 'https://csuitemag.com') + '/article/' + post.slug.current)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-[#1DA1F2] rounded hover:bg-[#1A8CD8] transition-colors"
                        aria-label="Share on Twitter"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                        </svg>
                      </a>
                      {/* Facebook */}
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent((process.env.NEXT_PUBLIC_SITE_URL || 'https://csuitemag.com') + '/article/' + post.slug.current)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center bg-[#1877F2] rounded hover:bg-[#166FE5] transition-colors"
                        aria-label="Share on Facebook"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Social Sharing removed to avoid duplicate blocks */}
                  
                  {/* Article Body */}
                  {Array.isArray(post.body) && post.body.length > 0 ? (
                    <PortableBody value={post.body as any[]} />
                  ) : bodyText && bodyText.trim().length > 0 ? (
                    <div className="prose prose-lg max-w-none">
                      <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg whitespace-pre-line">
                          {bodyText}
                        </p>
                        {/* End-of-Article Ad */}
                        <div className="my-12 bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
                          <Ad placement="in-article" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      <div className="space-y-6 text-gray-700 leading-relaxed">
                        <p className="text-lg first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#082945]">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
                        </p>

                        <h2 className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">A Practical Framework</h2>
                        <p>
                          Cras mattis consectetur purus sit amet fermentum. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Vestibulum id ligula porta felis euismod semper.
                        </p>

                        <ul className="list-disc list-inside space-y-2">
                          <li>Set clear, measurable outcomes to align teams.</li>
                          <li>Communicate decisions transparently to build trust.</li>
                          <li>Iterate in small steps to reduce risk while learning.</li>
                        </ul>

                        <blockquote className="border-l-4 border-[#c8ab3d] pl-6 my-8 italic text-xl text-gray-600">
                          “We do well by doing good — and by learning fast.”
                        </blockquote>


                        <h3 className="text-2xl font-serif font-normal text-gray-900 mt-8 mb-4">Bottom Line</h3>
                        <p>
                          Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Etiam porta sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed consectetur.
                        </p>

                        {/* End-of-Article Ad */}
                        <div className="my-12 bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
                          <Ad placement="in-article" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="sticky top-8 space-y-8">
                    {/* Ad Slot 1 */}
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <Ad placement="article-sidebar" />
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
                              <OptimizedImage
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
                        {Array.isArray(post.author.bio) && post.author.bio.length > 0 ? (
                          <div className="prose prose-sm max-w-none mb-4">
                            <PortableBody value={post.author.bio as any[]} />
                          </div>
                        ) : (
                          <p className="font-sans text-sm text-gray-600 leading-relaxed mb-4">
                            {typeof post.author.bio === 'string'
                              ? post.author.bio
                              : 'An experienced writer and thought leader in the field of executive leadership and business strategy.'}
                          </p>
                        )}
                        <Link 
                          href={`/author/${post.author.slug?.current || post.author.name.toLowerCase().replace(/ /g, '-')}`}
                          prefetch
                          className="font-sans text-sm font-medium text-[#082945] hover:text-[#0a3350] transition-colors"
                        >
                          More by {post.author.name} →
                        </Link>
                      </div>
                    )}
                    
                    {/* Related Articles */}
                    {relatedPosts.length > 0 && (
                      <div>
                        <h3 className="font-serif text-base font-semibold bg-[#082945] px-4 py-3 mb-4" style={{ color: '#ffffff' }}>
                          Related Articles
                        </h3>
                        <div className="space-y-6">
                          {relatedPosts.map((relatedPost) => (
                            <Link
                              key={relatedPost._id}
                              href={`/article/${relatedPost.slug.current}`}
                              prefetch
                              className="block group"
                            >
                              {relatedPost.mainImage && (
                                <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                                  <OptimizedImage
                                    src={urlFor(relatedPost.mainImage).width(400).height(300).url()}
                                    alt={relatedPost.mainImage.alt || relatedPost.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  />
                                </div>
                              )}
                              <h4 className="text-lg font-serif font-normal text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-2">
                                {relatedPost.title}
                              </h4>
                              <div className="flex items-center justify-between text-sm text-gray-500 font-sans">
                                {relatedPost.author && <span>By {relatedPost.author.name}</span>}
                                {relatedPost.views && (
                                  <span className="flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {(relatedPost.views / 1000000).toFixed(1)}M
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Ad Slot 2 */}
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
                      <Ad placement="article-sidebar-large" />
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
                              <p className="font-sans text-xs text-gray-500">2.8M views</p>
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
                              <p className="font-sans text-xs text-gray-500">2.4M views</p>
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
                              <p className="font-sans text-xs text-gray-500">2.1M views</p>
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
                              <p className="font-sans text-xs text-gray-500">1.1M views</p>
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
                              <p className="font-sans text-xs text-gray-500">1.9M views</p>
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

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Article not found — C-Suite Magazine',
      description: 'The requested article could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.excerpt || post.body?.[0]?.children?.[0]?.text?.substring(0, 160) + '...',
    keywords: post.tags || [],
    image: post.mainImage ? (post.mainImage.url || urlFor(post.mainImage).url()) : undefined,
    type: 'article',
    publishedTime: post.publishedAt,
    author: post.author?.name,
    section: post.categories?.[0]?.title
  })
}
const AdPopup = dynamic(() => import('@/components/AdPopup'))
