import { notFound } from 'next/navigation'
import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'
import PortableBody from '@/components/PortableBody'

// Removed local dummy author data. Authors now rely solely on Sanity content.

async function getAuthor(slug: string) {
  // Fetch from Sanity only
  const query = `*[_type == "author" && slug.current == $slug][0] {
    name,
    slug,
    position,
    bio,
    image,
    social,
    "articles": *[_type == "post" && author._ref == ^._id] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      "categories": categories[]->{title, slug, color},
      publishedAt,
      readTime
    }
  }`
  
  return client.fetch(query, { slug })
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)

  if (!author) {
    notFound()
  }

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: author.name }]} />
      
      <main className="bg-white">
        {/* Author Header */}
        <section className="dark-section py-16 bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Author Image */}
                {author.image && (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-white/20">
                    <OptimizedImage
                      src={author.image?.url || urlFor(author.image).width(256).height(256).url()}
                      alt={author.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="100vw"
                    />
                  </div>
                )}
                
                {/* Author Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                    {author.name}
                  </h1>
                  {author.position && (
                    <p className="text-xl text-[#c8ab3d] mb-4 font-medium">
                      {author.position}
                    </p>
                  )}
                  {Array.isArray(author.bio) ? (
                    <div className="prose prose-invert max-w-none mb-6">
                      <PortableBody value={author.bio} />
                    </div>
                  ) : author.bio ? (
                    <p className="text-lg text-gray-300 leading-relaxed mb-6">{author.bio}</p>
                  ) : null}
                  
                  {/* Social Links */}
                  <div className="flex justify-center md:justify-start">
                    {author.name && (
                      <a
                        href={`mailto:${author.name.split(' ')[0].toLowerCase()}@csuitemagazine.global`}
                        className="text-gray-200 hover:text-white font-medium underline decoration-[#c8ab3d] underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                      >
                        {`${author.name.split(' ')[0].toLowerCase()}@csuitemagazine.global`}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles by Author */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                Articles by {author.name}
              </h2>
              <p className="text-gray-600 mb-10">
                {author.articles?.length || 0} {author.articles?.length === 1 ? 'article' : 'articles'} published
              </p>

              {author.articles && author.articles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {author.articles.map((article: any) => (
                    <Link
                      key={article._id}
                      href={`/article/${article.slug.current}`}
                      prefetch
                      className="group focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                    >
                      <article className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col card-hover-scale reveal">
                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                          {article.mainImage?.url ? (
                            <OptimizedImage
                              src={article.mainImage.url}
                              alt={article.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {article.categories && article.categories[0] && (
                            <span
                              className="category-badge-flash absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded"
                              style={{ backgroundColor: article.categories[0].color || '#c8ab3d' }}
                            >
                              {article.categories[0].title}
                            </span>
                          )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-gray-600 mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                            {article.publishedAt && (
                              <time>{formatDate(article.publishedAt)}</time>
                            )}
                            {article.views && (
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {(article.views / 1000000).toFixed(1)}M
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-lg">No articles published yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
