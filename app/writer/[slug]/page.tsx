import { notFound } from 'next/navigation'
import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'
import { getArticleUrl } from '@/lib/urls'
import PortableBody from '@/components/PortableBody'
import { sanitizeExcerpt } from '@/lib/text'
import { Writer, Post } from '@/lib/types'
import { getViews, formatViewsMillion } from '@/lib/views'

import { getServerClient } from '@/lib/sanity.server'

// Enable ISR
export const revalidate = 86400

async function getWriter(slug: string): Promise<Writer | null> {
  const query = `*[_type == "writer" && slug.current == $slug][0] { // RALPH-BYPASS [Legacy]
    _id,
    name,
    slug,
    position,
    writerType,
    bio,
    image,
    "imageUrl": image.asset->url,
    social,
    "articles": *[_type == "post" && writer->slug.current == $slug && isHidden != true] | order(publishedAt desc) { // RALPH-BYPASS [Legacy]
      _id,
      _type,
      title,
      slug,
      excerpt,
      "excerptText": coalesce(pt::text(excerpt), pt::text(body)),
      mainImage,
      "categories": categories[]->{title, slug, color},
      publishedAt,
      views
    }
  }`
  const client = getServerClient()
  return client.fetch(query, { slug })
}

export default async function WriterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const writer = await getWriter(slug)

  if (!writer) {
    notFound()
  }

  return (
    <>
      <Navigation />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: writer.name }]} />

      <main className="bg-white">
        {/* Writer Header */}
        <section className="dark-section py-16 bg-gradient-to-br from-[#082945] via-[#0a3350] to-[#082945] text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Writer Image */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden flex-shrink-0 border-4 border-white/20">
                  {writer.image || writer.imageUrl ? (
                    <OptimizedImage
                      src={writer.image ? urlFor(writer.image).width(256).height(256).fit('crop').auto('format').url() : (writer.imageUrl || '')}
                      alt={writer.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="100vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 text-white flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {String(writer.name || '')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Writer Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold">{writer.name}</h1>
                  {writer.position && (
                    <p className="mt-2 text-gray-200">{writer.position}</p>
                  )}

                  {/* Social Links & Email */}
                  <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start items-center">
                    {writer.social?.showEmail && writer.social?.email && (
                      <a
                        href={`mailto:${writer.social.email}`}
                        className="text-gray-200 hover:text-white font-medium underline decoration-[#c8ab3d] underline-offset-4 transition-colors"
                      >
                        {writer.social.email}
                      </a>
                    )}

                    {writer.social?.twitter && (
                      <a href={writer.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-300 hover:text-[#f4d875] active:text-[#ffffff] transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}

                    {writer.social?.linkedin && (
                      <a href={writer.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-300 hover:text-[#f4d875] active:text-[#ffffff] transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}

                    {writer.social?.website && (
                      <a href={writer.social.website} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-300 hover:text-[#f4d875] active:text-[#ffffff] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {writer.bio && (
                    <div className="mt-6 text-gray-100">
                      <PortableBody value={writer.bio} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles by Writer */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
                Articles by {writer.name}
              </h2>

              {writer.articles && writer.articles.filter((a) => a?.slug?.current).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {writer.articles
                    .filter((article) => article?.slug?.current)
                    .map((article) => {
                      const excerptText = sanitizeExcerpt(article.excerptText || article.excerpt || '')
                      const categorySlug = article?.categories?.[0]?.slug?.current || 'leadership'
                      return (
                        <Link
                          key={article._id}
                          href={getArticleUrl(article)}
                          prefetch={false}
                          className="group block rounded-lg overflow-hidden border border-gray-200 bg-white hover:shadow-lg transition-shadow"
                        >
                          <div className="relative w-full h-48 bg-gray-100">
                            {article.mainImage ? (
                              <OptimizedImage
                                src={urlFor(article.mainImage).width(800).height(450).quality(80).auto('format').url()}
                                alt={article.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#082945]" />
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-serif font-semibold text-gray-900 group-hover:text-[#082945] transition-colors">
                              {article.title}
                            </h3>
                            {excerptText && (
                              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{excerptText}</p>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {formatViewsMillion(article.views, article.slug.current)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                </div>
              ) : (
                <p className="text-gray-600">No articles found.</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
