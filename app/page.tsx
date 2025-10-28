import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'

async function getFeaturedPosts(): Promise<Post[]> {
  const query = `*[_type == "post" && isFeatured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    "author": author->{name, slug, position, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    isFeatured,
    readTime,
    publishedAt
  }`
  
  return client.fetch(query)
}

async function getLatestPosts(): Promise<Post[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) [0...6] {
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
  
  return client.fetch(query)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default async function Home() {
  const featuredPosts = await getFeaturedPosts()
  const latestPosts = await getLatestPosts()

  return (
    <>
      <Navigation />
      
      <main>
        {/* Hero Section - Using exact competitor color #082945 */}
        <section className="bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-5xl md:text-7xl font-serif font-black mb-6 leading-tight">
                Leadership.<br />Innovation.<br />Excellence.
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Exclusive insights and strategies for global executives and business leaders
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/articles"
                  className="bg-[#c8ab3d] text-[#082945] px-8 py-4 rounded-md font-semibold text-lg hover:bg-[#b39935] transition-colors"
                >
                  Explore Articles
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white text-white px-8 py-4 rounded-md font-semibold text-lg hover:bg-white hover:text-[#082945] transition-colors"
                >
                  About Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-4xl font-serif font-black text-gray-900">Featured Stories</h3>
                <span className="text-[#c8ab3d] font-semibold">★ Editor's Choice</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/articles/${post.slug.current}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="relative h-64 overflow-hidden">
                      {post.mainImage && (
                        <Image
                          src={urlFor(post.mainImage).width(600).height(400).url()}
                          alt={post.mainImage.alt || post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
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
                      <h4 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-[#082945] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{post.author?.name}</span>
                        {post.readTime && <span>{post.readTime} min read</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Latest Articles */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-4xl font-serif font-black text-gray-900 mb-10">Latest Insights</h3>
            
            {latestPosts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <h4 className="text-2xl font-serif font-bold text-gray-900 mb-4">Coming Soon</h4>
                <p className="text-gray-600 mb-6">
                  We're preparing exceptional content for you. Check back soon!
                </p>
                <Link
                  href="/studio"
                  className="inline-block bg-[#082945] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#0a3350] transition-colors"
                >
                  Add Content via Studio
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestPosts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/articles/${post.slug.current}`}
                    className="group"
                  >
                    <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden">
                        {post.mainImage && (
                          <Image
                            src={urlFor(post.mainImage).width(500).height(350).url()}
                            alt={post.mainImage.alt || post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
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
                      <div className="p-6 flex-1 flex flex-col">
                        <h4 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        {post.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                          <span className="font-medium">{post.author?.name}</span>
                          {post.readTime && <span>{post.readTime} min</span>}
                        </div>
                        {post.publishedAt && (
                          <time className="text-xs text-gray-400 mt-2 block">
                            {formatDate(post.publishedAt)}
                          </time>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-[#082945] text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-4xl font-serif font-black mb-4">Join Our Community</h3>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Subscribe to receive exclusive insights, interviews, and strategies from world-class executives
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]"
              />
              <button
                type="submit"
                className="bg-[#c8ab3d] text-[#082945] px-8 py-4 rounded-md font-semibold hover:bg-[#b39935] transition-colors whitespace-nowrap"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
