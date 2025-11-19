import { notFound } from 'next/navigation'
import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
import { client, urlFor } from '@/lib/sanity'
import PortableBody from '@/components/PortableBody'
import { sanitizeExcerpt } from '@/lib/text'

// Enable ISR to avoid heavy full-build prerenders for writer pages
export const revalidate = 600

async function getWriter(slug: string) {
  const query = `*[_type == "writer" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    position,
    bio,
    image,
    "imageUrl": image.asset->url,
    social,
    "articles": *[_type == "post" && writer->slug.current == $slug && isHidden != true] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      // Ensure a safe plaintext excerpt regardless of field type
      "excerptText": coalesce(pt::text(excerpt), pt::text(body)),
      mainImage,
      "categories": categories[]->{title, slug, color},
      publishedAt,
      views
    }
  }`
  return client.fetch(query, { slug })
}

export default async function WriterPage({ params }: { params: { slug: string } }) {
  const { slug } = params
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
                      src={writer.image ? urlFor(writer.image).width(256).height(256).fit('crop').auto('format').url() : writer.imageUrl}
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
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold">{writer.name}</h1>
                  {writer.position && (
                    <p className="mt-2 text-gray-200">{writer.position}</p>
                  )}
                  {/* Writer Email - restored */}
                  <a
                    href={`mailto:${writer.name.split(' ')[0].toLowerCase()}@csuitemagazine.global`}
                    className="mt-2 block text-gray-200 hover:text-white font-medium underline decoration-[#c8ab3d] underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                  >
                    {`${writer.name.split(' ')[0].toLowerCase()}@csuitemagazine.global`}
                  </a>
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

              {writer.articles && writer.articles.filter((a: any) => a?.slug?.current).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {writer.articles
                    .filter((article: any) => article?.slug?.current)
                    .map((article: any) => {
                      const excerptText = sanitizeExcerpt(article.excerptText || article.excerpt || '')
                      const categorySlug = article?.categories?.[0]?.slug?.current || 'leadership'
                      return (
                        <Link
                          key={article._id}
                          href={`/category/${categorySlug}/${article.slug.current}`}
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
