import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import ArchiveFilters from '@/components/ArchiveFilters'
import { client, urlFor } from '@/lib/sanity'
import { Post, Category } from '@/lib/types'
import { Suspense } from 'react'

async function getPosts(): Promise<Post[]> {
  const query = `
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      author->{name, image},
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
    }
  `
  
  try {
    return await client.fetch(query)
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

export default async function ArchivePage() {
  const [posts, categories] = await Promise.all([
    getPosts(),
    getCategories()
  ])

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Archive' }]} />

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="dark-section bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4 text-white">Archive</h1>
            <p className="text-xl text-white max-w-2xl mx-auto">Browse all articles — jump straight into reading</p>
          </div>
        </div>

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
          <ArchiveFilters posts={posts} categories={categories} />
        </Suspense>
       </main>

       <Footer />
     </>
   )
 }
