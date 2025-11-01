import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'

export default async function ArchivePage() {
  // Fetch all articles to list directly in the archive
  const posts: Post[] = await client
    .fetch(
      `*[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        "author": author->{name},
        mainImage,
        "categories": categories[]->{title, slug, color},
        views,
        publishedAt
      }`
    )
    .catch(() => [])

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

        {/* Articles Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.length === 0 ? (
              <div className="text-center py-16 col-span-full">
                <p className="text-lg text-gray-600">No articles yet. Please check back soon.</p>
              </div>
            ) : (
              posts.map((post, idx) => {
                const slug = post?.slug?.current as string | undefined
                const isValidSlug = !!slug && !slug.startsWith('#')
                const categoryTitle = post.categories && post.categories[0] ? post.categories[0].title : null
                const viewCount = (post as any).views

                const CardBody = (
                  <article
                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group gradient-border-card h-full flex flex-col"
                    role="article"
                  >
                    <div className="relative h-80 overflow-hidden bg-gray-200">
                      {post.mainImage?.url ? (
                        <OptimizedImage
                          src={post.mainImage.url || urlFor(post.mainImage).width(600).height(400).url()}
                          alt={post.mainImage.alt || `Featured image for ${post.title}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority={idx < 3}
                        />
                      ) : post.mainImage ? (
                        <OptimizedImage
                          src={urlFor(post.mainImage).width(600).height(400).url()}
                          alt={post.mainImage.alt || `Featured image for ${post.title}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority={idx < 3}
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
                          style={{ backgroundColor: post.categories[0].color || '#c8ab3d' }}
                          role="badge"
                          aria-label={`Category: ${categoryTitle}`}
                        >
                          {categoryTitle}
                        </span>
                      )}
                      {viewCount && (
                        <div className="absolute top-4 right-4 bg-[#c8ab3d] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          {(viewCount / 1000000).toFixed(1)}M
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2">{post.title}</h3>
                      {post.excerpt && <p className="text-gray-600 mb-4 line-clamp-3 flex-1">{post.excerpt}</p>}
                      <div className="mt-auto text-sm text-gray-500 flex items-center justify-between">
                        {post.author?.name && <span>{post.author.name}</span>}
                        {post.publishedAt && (
                          <time dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString()}</time>
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
                    className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                  >
                    {CardBody}
                  </Link>
                ) : (
                  <div key={post._id}>{CardBody}</div>
                )
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

