import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import ArchiveFilters from '@/components/ArchiveFilters'
import { client, urlFor } from '@/lib/sanity'
import { Post, Category } from '@/lib/types'
import { Suspense } from 'react'

import { resolveFeaturedHeroImage } from '@/lib/resolveFeaturedHeroImage'

async function getPosts(categoryFilter?: string): Promise<Post[]> {
  // Build query with server-side filtering
  let query = `*[_type == "post" && isHidden != true`

  // Add category filter if provided
  if (categoryFilter && categoryFilter !== 'all') {
    query += ` && "${categoryFilter}" in categories[]->title`
  }

  query += `] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    writer->{name, image},
    mainImage{
      asset->{
        _id,
        url
      },
      alt
    },
    categories[]->{title, color, slug},
    publishedAt,
    views
  }`

  try {
    const posts = await client.fetch<Post[]>(query)
    // Resolve fallback images server-side (Issue #28 Fix)
    return posts.map(post => ({
      ...post,
      fallbackImageUrl: resolveFeaturedHeroImage(post)
    }))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching posts:', error)
    }
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  const query = `
    *[_type == "category"] | order(title asc) {
      _id,
      title,
      slug
    }
  `

  try {
    return await client.fetch(query)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error fetching categories:', error)
    }
    return []
  }
}

type PageProps = {
  searchParams: { category?: string }
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const categoryFilter = searchParams.category || 'all'

  const [posts, categories] = await Promise.all([
    getPosts(categoryFilter),
    getCategories()
  ])

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Magzine Archive' }]} />

      <main className="min-h-screen bg-gray-50">
        {/* Header removed per request */}

        {/* Archive Content with Filters and Pagination */}
        <Suspense fallback={
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-96 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <ArchiveFilters posts={posts} categories={categories} initialCategory={categoryFilter} />
        </Suspense>
      </main>

      <Footer />
    </>
  )
}
