'use client'

import { useState } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'
import SkeletonCard from '@/components/SkeletonCard'

interface FeaturedCXOsProps {
  articles?: any[]
}

export default function FeaturedCXOs({ articles = [] }: FeaturedCXOsProps) {
  const posts = articles ?? []
  const [visibleCount, setVisibleCount] = useState(6)
  
  const visiblePosts = posts.slice(0, visibleCount)
  const hasMore = visibleCount < posts.length

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, posts.length))
  }

  // Handle keyboard navigation for load more button
  const handleLoadMoreKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      loadMore()
    }
  }

  if (posts.length === 0) {
    return (
      <section 
        id="featured-cxos" 
        className="py-16 bg-gray-50"
        aria-labelledby="featured-cxos-heading"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h3 id="featured-cxos-heading" className="text-4xl font-serif font-black text-gray-900">
              Featured CXOs
            </h3>
            <span className="text-[#c8ab3d] font-semibold" role="badge" aria-label="Editor's Choice selection">
              ★ Editor's Choice
            </span>
          </div>
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            aria-busy="true"
            aria-label="Loading featured CXO articles"
            role="status"
          >
            <span className="sr-only">Loading featured CXO articles...</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section 
      id="featured-cxos" 
      className="py-16 bg-gray-50"
      aria-labelledby="featured-cxos-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h3 id="featured-cxos-heading" className="text-4xl font-serif font-black text-gray-900">
            Featured CXOs
          </h3>
          <span className="text-[#c8ab3d] font-semibold" role="badge" aria-label="Editor's Choice selection">
            ★ Editor's Choice
          </span>
        </div>
        
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          role="feed"
          aria-label="Featured CXO articles"
          aria-busy="false"
        >
          {visiblePosts.map((post, idx) => {
            const slug = post?.slug?.current as string | undefined
            const isValidSlug = !!slug && !slug.startsWith('#')
            const postTitle = post.title
            const postExcerpt = post.excerpt
            const authorName = post.author?.name
            const categoryTitle = post.categories && post.categories[0] ? post.categories[0].title : null
            const viewCount = post.views

            const CardInner = (
              <article
                className="h-full flex flex-col"
                role="article"
                aria-labelledby={`featured-article-title-${idx}`}
                aria-describedby={postExcerpt ? `featured-article-excerpt-${idx}` : undefined}
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                  {post.mainImage?.url ? (
                    <OptimizedImage
                      src={post.mainImage.url || urlFor(post.mainImage).width(600).height(400).url()}
                      alt={post.mainImage.alt || `Featured image for ${postTitle}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={idx < 3}
                    />
                  ) : post.mainImage ? (
                    <OptimizedImage
                      src={urlFor(post.mainImage).width(600).height(400).url()}
                      alt={post.mainImage.alt || `Featured image for ${postTitle}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={idx < 3}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" role="img" aria-label="No image available">
                      <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {categoryTitle && (
                    <span
                      className="category-badge-flash absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded"
                      style={{ backgroundColor: post.categories[0].color || '#c8ab3d' }}
                      role="badge"
                      aria-label={`Category: ${categoryTitle}`}
                    >
                      {categoryTitle}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h4 
                    id={`featured-article-title-${idx}`}
                    className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-[#082945] transition-colors line-clamp-2"
                  >
                    {postTitle}
                  </h4>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3" role="list" aria-label="Article tags">
                      {post.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                          role="listitem"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {postExcerpt && (
                    <p 
                      id={`featured-article-excerpt-${idx}`}
                      className="text-gray-600 mb-4 line-clamp-3 flex-1"
                    >
                      {postExcerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                    {authorName && (
                      <span aria-label={`Author: ${authorName}`}>
                        {authorName}
                      </span>
                    )}
                    {viewCount && (
                      <span className="flex items-center gap-1" aria-label={`${(viewCount / 1000000).toFixed(1)} million views`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span aria-hidden="true">{(viewCount / 1000000).toFixed(1)}M</span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            )

            return isValidSlug ? (
              <Link
                key={post._id}
                href={`/article/${slug}`}
                prefetch
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 transition-shadow duration-300 card-hover-scale reveal"
                style={{ transitionDelay: `${idx * 80}ms` }}
                aria-label={`Read featured article: ${postTitle}${authorName ? ` by ${authorName}` : ''}`}
              >
                {CardInner}
              </Link>
            ) : (
              <div
                key={post._id}
                className="group bg-white rounded-lg overflow-hidden shadow-md card-hover-scale cursor-default reveal"
                style={{ transitionDelay: `${idx * 80}ms` }}
                aria-disabled="true"
                role="article"
                aria-label={`Featured article unavailable: ${postTitle}`}
              >
                {CardInner}
              </div>
            )
          })}
        </div>

        {/* Read More Button - Navigate to Archive */}
        <div className="flex items-center justify-center mt-12">
          <Link
            href="/archive"
            prefetch
            className="px-8 py-3 bg-[#082945] text-white font-semibold rounded-lg hover:bg-[#0a3251] focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 transition-colors duration-300 shadow-lg hover:shadow-xl btn-shimmer"
            aria-label="View all articles in archive"
          >
            Read More
          </Link>
        </div>

        {/* Pagination Info removed per request */}
      </div>
    </section>
  )
}
