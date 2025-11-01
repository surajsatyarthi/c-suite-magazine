import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'

async function searchPosts(query: string): Promise<Post[]> {
  const groqQuery = `*[_type == "post" && (
    title match $searchQuery + "*" ||
    excerpt match $searchQuery + "*" ||
    pt::text(body) match $searchQuery + "*"
  )] | order(publishedAt desc) [0...20] {
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
  
  return client.fetch(groqQuery, { searchQuery: query })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''
  const results = query ? await searchPosts(query) : []

  return (
    <>
      <Navigation />
      
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-black text-gray-900 mb-2">
              Search Results
            </h1>
            {query && (
              <p className="text-gray-600 text-lg">
                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </p>
            )}
          </div>

          {!query && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-xl text-gray-500">
                Enter a search query to find articles
              </p>
            </div>
          )}

          {query && results.length === 0 && (
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-xl text-gray-600 mb-2">No results found</p>
              <p className="text-gray-500">
                Try different keywords or browse our categories
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.map((post) => (
                <Link
                  key={post._id}
                  href={`/article/${post.slug.current}`}
                  prefetch
                  className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                    {post.mainImage ? (
                      <OptimizedImage
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
                      {post.readTime && <span>{post.readTime} min read</span>}
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
