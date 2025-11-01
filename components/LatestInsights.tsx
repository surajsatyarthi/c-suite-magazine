"use client"

import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { useState } from 'react'
import { urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'
import SkeletonCard from '@/components/SkeletonCard'

type LatestInsightsProps = {
  articles: Post[]
}

export default function LatestInsights({ articles }: LatestInsightsProps) {
  const [visibleCount, setVisibleCount] = useState(6)
  const visibleArticles = articles.slice(0, visibleCount)
  const hasMore = visibleCount < articles.length

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, articles.length))
  }

  // Handle keyboard navigation for load more button
  const handleLoadMoreKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      loadMore()
    }
  }

  return (
    <section className="py-16" aria-labelledby="latest-insights-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h3 id="latest-insights-heading" className="text-4xl font-serif font-black text-gray-900 mb-10">
          Latest Insights
        </h3>

        {visibleArticles.length > 0 ? (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            role="feed"
            aria-label="Latest articles"
            aria-busy="false"
          >
            {visibleArticles.map((post, index) => {
              const slug = (post as any)?.slug?.current as string | undefined
              const isValidSlug = !!slug && !slug.startsWith('#')
              const postTitle = (post as any).title
              const postExcerpt = (post as any).excerpt
              const authorName = (post as any)?.author?.name
              const categoryTitle = post.categories && (post.categories as any)[0] ? ((post.categories as any)[0]).title : null
              const viewCount = (post as any).views

              const ArticleCard = (
                <article 
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col card-hover-scale reveal focus-within:ring-2 focus-within:ring-[#c8ab3d] focus-within:ring-offset-2" 
                  style={{ transitionDelay: `${index * 80}ms` }}
                  role="article"
                  aria-labelledby={`article-title-${index}`}
                  aria-describedby={postExcerpt ? `article-excerpt-${index}` : undefined}
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                    {post.mainImage?.url ? (
                      <OptimizedImage
                        src={post.mainImage.url || urlFor(post.mainImage).width(500).height(350).url()}
                        alt={post.mainImage.alt || `Featured image for ${postTitle}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index < 3}
                      />
                    ) : (post as any).mainImage ? (
                      <OptimizedImage
                        src={urlFor((post as any).mainImage).width(500).height(350).url()}
                        alt={(post as any).mainImage.alt || `Featured image for ${postTitle}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index < 3}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" role="img" aria-label="No image available">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {categoryTitle && (
                      <span
                        className="category-badge-flash absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded"
                        style={{ backgroundColor: ((post.categories as any)[0]).color || '#c8ab3d' }}
                        role="badge"
                        aria-label={`Category: ${categoryTitle}`}
                      >
                        {categoryTitle}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 
                      id={`article-title-${index}`}
                      className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2"
                    >
                      {postTitle}
                    </h4>
                    {post.tags && (post.tags as any)?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3" role="list" aria-label="Article tags">
                        {(post.tags as any).slice(0, 2).map((tag: string, tagIndex: number) => (
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
                        id={`article-excerpt-${index}`}
                        className="text-gray-600 mb-4 line-clamp-2 flex-1"
                      >
                        {postExcerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                      {authorName && (
                        <span className="font-medium" aria-label={`Author: ${authorName}`}>
                          {authorName}
                        </span>
                      )}
                      {viewCount && (
                        <span className="flex items-center gap-1" aria-label={`${(viewCount / 1000000).toFixed(1)} million views`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span aria-hidden="true">{((viewCount as number) / 1000000).toFixed(1)}M</span>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              )

              return isValidSlug ? (
                <Link 
                  key={(post as any)._id} 
                  href={`/article/${slug}`} 
                  prefetch
                  className="group bg-white focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 rounded-lg overflow-hidden shadow-md"
                  aria-label={`Read article: ${postTitle}${authorName ? ` by ${authorName}` : ''}`}
                >
                  {ArticleCard}
                </Link>
              ) : (
                <div 
                  key={(post as any)._id} 
                  className="group bg-white rounded-lg overflow-hidden shadow-md" 
                  aria-disabled="true"
                  role="article"
                  aria-label={`Article unavailable: ${postTitle}`}
                >
                  {ArticleCard}
                </div>
              )
            })}
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            aria-busy="true"
            aria-label="Loading articles"
            role="status"
          >
            <span className="sr-only">Loading latest articles...</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            href="/archive"
            prefetch
            className="px-6 py-3 rounded-md bg-[#082945] text-white font-medium hover:bg-[#0b3764] focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 transition-colors btn-shimmer"
            aria-label="View all articles in archive"
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  )
}
