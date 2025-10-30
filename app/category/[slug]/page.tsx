import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'

interface Category {
  title: string
  slug: { current: string }
  description?: string
  color?: string
}

async function getCategory(slug: string): Promise<Category | null> {
  const query = `*[_type == "category" && slug.current == $slug][0] {
    title,
    slug,
    description,
    color
  }`
  
  return client.fetch(query, { slug })
}

async function getCategoryPosts(slug: string): Promise<Post[]> {
  const query = `*[_type == "post" && $slug in categories[]->slug.current] | order(publishedAt desc) [0...20] {
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
  
  return client.fetch(query, { slug })
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = [
    'leadership', 'business', 'manufacturing', 'public-sector', 'events',
    'innovation', 'not-for-profit', 'philanthropy', 'it-telco', 'money-finance',
    'engineering', 'science-technology', 'sustainability',
    'professional-services', 'startups', 'retail', 'energy',
    'changemakers', 'ceo-woman', 'education', 'automotive-logistics',
    'healthcare', 'entrepreneurs', 'property-real-estate', 'bfsi', 'construction-mining'
  ]

  return categories.map((slug) => ({
    slug,
  }))
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategory(slug)
  const posts = await getCategoryPosts(slug)

  // If category doesn't exist in CMS, create a default one
  const displayCategory = category || {
    title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    slug: { current: slug },
    description: `Explore articles about ${slug.replace(/-/g, ' ')}`,
    color: '#c8ab3d'
  }

  return (
    <>
      <Navigation />
      
      <main className="min-h-screen bg-gray-50">
        {/* Category Header */}
        <div 
          className="dark-section py-20 text-white"
          style={{ backgroundColor: displayCategory.color || '#082945' }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-serif font-black mb-4">
              {displayCategory.title}
            </h1>
            {displayCategory.description && (
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {displayCategory.description}
              </p>
            )}
            <div className="mt-6">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                No articles yet
              </h3>
              <p className="text-gray-600 mb-6">
                Check back soon for content in this category
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#082945] text-white rounded-lg hover:bg-[#0a3a5c] transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/article/${post.slug.current}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                    {post.mainImage ? (
                      <Image
                        src={urlFor(post.mainImage).width(500).height(350).url()}
                        alt={post.title}
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
                        className="absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded"
                        style={{ backgroundColor: post.categories[0].color || '#c8ab3d' }}
                      >
                        {post.categories[0].title}
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-medium">{post.author?.name}</span>
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
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
