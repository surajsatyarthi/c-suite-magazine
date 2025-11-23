
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'
import { Post, Category } from '@/lib/types'
import { sanitizeExcerpt, sanitizeTitle } from '@/lib/text'
import { formatViewsMillion } from '@/lib/views'

interface ArchiveFiltersProps {
  posts: Post[]
  categories: Category[]
  initialCategory?: string
}

export default function ArchiveFilters({ posts, categories, initialCategory = 'all' }: ArchiveFiltersProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const router = useRouter()

  const POSTS_PER_PAGE = 12

  // Calculate pagination (filtering is now server-side)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = posts.slice(startIndex, endIndex)

  // Handle category filter change - triggers server-side refetch
  const handleCategoryChange = (newCategory: string) => {
    setCategoryFilter(newCategory)
    setCurrentPage(1)

    // Update URL to trigger server-side filtering
    if (newCategory === 'all') {
      router.push('/archive')
    } else {
      router.push(`/ archive ? category = ${encodeURIComponent(newCategory)} `)
    }
  }

  const clearFilters = () => {
    setCategoryFilter('all')
    setCurrentPage(1)
    router.push('/archive')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header removed per request */}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Category Filter only */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category.title}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Removed results count display */}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length === 0 ? (
          <div className="text-center py-16 col-span-full">
            <p className="text-lg text-gray-600">
              {posts.length === 0 ? 'No articles yet. Please check back soon.' : 'No articles match your current filters.'}
            </p>
            {posts.length === 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[#082945] text-white rounded-lg hover:bg-[#0a3a5c] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          currentPosts.map((post, idx) => {
            const slug = post?.slug?.current as string | undefined
            const isValidSlug = !!slug && !slug.startsWith('#')
            const imageUrl = post.mainImage?.asset?.url || post.mainImage?.url
            const authorImageUrl = (post as any)?.writer?.image?.asset?.url || (post as any)?.writer?.image?.url

            return (
              <article key={post._id || idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Article Image / Placeholder */}
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                  {imageUrl ? (
                    <OptimizedImage
                      src={imageUrl}
                      alt={post.mainImage?.alt || post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" role="img" aria-label="No image available">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Categories */}
                  {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.categories.slice(0, 2).map((category, catIdx) => (
                        <span
                          key={catIdx}
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: category.color || '#082945' }}
                        >
                          {category.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {isValidSlug ? (
                      <Link href={(() => { const cat = ((post as any)?.categories?.[0]?.slug?.current as string | undefined) || 'general'; return `/ category / ${cat}/${slug}` })()} className="hover:text-[#082945] transition-colors" >
                        {sanitizeTitle(post.title)}
                      </Link >
                    ) : (
                      sanitizeTitle(post.title)
                    )}
                  </h2 >

                  {/* Excerpt */}
                  {
                    post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {sanitizeExcerpt(post.excerpt, sanitizeTitle(post.title))}
                      </p>
                    )
                  }

                  {/* Meta: Writer and Views (date removed) */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {authorImageUrl && (
                        <OptimizedImage
                          src={authorImageUrl}
                          alt={(post as any)?.writer?.name || 'Writer'}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span>{(post as any)?.writer?.name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {typeof post.views === 'number' && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {formatViewsMillion(post.views)}
                        </span>
                      )}
                    </div>
                  </div>
                </div >
              </article >
            )
          })
        )}
      </div >

      {/* Clear Filters Button */}
      {
        (categoryFilter !== 'all') && (
          <div className="mt-8 text-center">
            <button
              onClick={clearFilters}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )
      }

      {/* Pagination */}
      {
        totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )
      }
    </div >
  )
}
