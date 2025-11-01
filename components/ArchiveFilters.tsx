'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'
import { Post, Category } from '@/lib/types'

interface ArchiveFiltersProps {
  posts: Post[]
  categories: Category[]
}

export default function ArchiveFilters({ posts, categories }: ArchiveFiltersProps) {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts)
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const POSTS_PER_PAGE = 12
  const TOTAL_ARTICLES = 740 // Hard coded total count

  // Set initial filters from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const contentTypeParam = searchParams.get('contentType')
    
    if (categoryParam) {
      setCategoryFilter(categoryParam)
    }
    
    if (contentTypeParam) {
      setContentTypeFilter(contentTypeParam)
    }
  }, [searchParams])

  // Filter posts based on selected filters
  useEffect(() => {
    let filtered = posts

    // Filter by content type
    if (contentTypeFilter === 'cxo-interview') {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes('interview') ||
        post.title.toLowerCase().includes('cxo') ||
        post.title.toLowerCase().includes('ceo') ||
        post.title.toLowerCase().includes('executive') ||
        (post.categories && post.categories.some(cat => 
          cat.title.toLowerCase().includes('interview') ||
          cat.title.toLowerCase().includes('executive') ||
          cat.title.toLowerCase().includes('cxo')
        ))
      )
    } else if (contentTypeFilter === 'opinion') {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes('opinion') ||
        post.title.toLowerCase().includes('perspective') ||
        post.title.toLowerCase().includes('insight') ||
        post.title.toLowerCase().includes('analysis') ||
        (post.categories && post.categories.some(cat => 
          cat.title.toLowerCase().includes('opinion') ||
          cat.title.toLowerCase().includes('perspective') ||
          cat.title.toLowerCase().includes('insight') ||
          cat.title.toLowerCase().includes('analysis')
        )) ||
        // Include articles that are not interviews
        (!post.title.toLowerCase().includes('interview') &&
         !post.title.toLowerCase().includes('cxo') &&
         !(post.categories && post.categories.some(cat => 
           cat.title.toLowerCase().includes('interview') ||
           cat.title.toLowerCase().includes('cxo')
         )))
      )
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => 
        post.categories && post.categories.some(cat => 
          cat.title === categoryFilter
        )
      )
    }

    setFilteredPosts(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [posts, contentTypeFilter, categoryFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = filteredPosts.slice(startIndex, endIndex)

  const clearFilters = () => {
    setContentTypeFilter('all')
    setCategoryFilter('all')
    setCurrentPage(1)
    router.push('/archive')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Article Archive</h1>
        <p className="text-xl text-gray-600">
          Explore our comprehensive collection of insights and interviews
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Content Type Filter */}
          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <select
              id="contentType"
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Content</option>
              <option value="cxo-interview">CXO Interviews</option>
              <option value="opinion">Opinion & Analysis</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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

      {/* Results Count */}
      <div className="mb-8 text-center">
        <p className="text-gray-600">
          Showing {currentPosts.length} of {TOTAL_ARTICLES} articles
          {(contentTypeFilter !== 'all' || categoryFilter !== 'all') && (
            <span className="ml-2 text-sm">
              ({filteredPosts.length} filtered results)
            </span>
          )}
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 col-span-full">
            <p className="text-lg text-gray-600">
              {posts.length === 0 ? 'No articles yet. Please check back soon.' : 'No articles match your current filters.'}
            </p>
            {posts.length > 0 && filteredPosts.length === 0 && (
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
            const authorImageUrl = post.author?.image?.asset?.url || post.author?.image?.url

            return (
              <article key={post._id || idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Article Image */}
                {imageUrl && (
                  <div className="aspect-video relative overflow-hidden">
                    <OptimizedImage
                      src={imageUrl}
                      alt={post.mainImage?.alt || post.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

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
                      <Link href={`/article/${slug}`} className="hover:text-[#082945] transition-colors">
                        {post.title}
                      </Link>
                    ) : (
                      post.title
                    )}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Author and Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      {authorImageUrl && (
                        <OptimizedImage
                          src={authorImageUrl}
                          alt={post.author?.name || 'Author'}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      )}
                      <span>{post.author?.name || 'Anonymous'}</span>
                    </div>
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Clear Filters Button */}
      {(contentTypeFilter !== 'all' || categoryFilter !== 'all') && (
        <div className="mt-8 text-center">
          <button
            onClick={clearFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
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
      )}

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  )
}