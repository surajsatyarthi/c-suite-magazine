
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { getViews, formatViewsMillion } from '@/lib/views'
import { urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'
import { getCategoryColor } from '@/lib/categoryColors'
import SkeletonCard from '@/components/SkeletonCard'
import { sanitizeExcerpt, sanitizeTitle } from '@/lib/text'

type LatestInsightsProps = {
  articles: Post[]
}

export default function LatestInsights({ articles }: LatestInsightsProps) {
  const visibleArticles = articles.slice(0, 6)


  return (
    <section className="py-16" aria-labelledby="latest-insights-heading">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-none">
        <h3 id="latest-insights-heading" className="text-4xl font-serif font-black text-gray-900 mb-10">
          Latest Insights
        </h3>

        {visibleArticles.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            role="feed"
            aria-label="Latest articles"
            aria-busy="false"
          >
            {visibleArticles.map((post, index) => {
              const slug = (post as any)?.slug?.current as string | undefined
              const isValidSlug = !!slug && !slug.startsWith('#')
              const postTitleRaw = (post as any)?.seo?.metaTitle || (post as any).title
              const postTitle = sanitizeTitle(postTitleRaw)
              const postExcerptRaw = (post as any).excerpt
              const postExcerpt = sanitizeExcerpt(postExcerptRaw, postTitle)
              const writerName = (post as any)?.writer?.name
              const categories = (post as any)?.categories || []
              const nonCxoCategory = categories.find((c: any) => c?.slug?.current !== 'cxo-interview')
              const displayCategory = nonCxoCategory || categories[0]
              const categoryTitle = displayCategory?.title || null
              const viewsNum = getViews(slug, (post as any)?.views)
              const displayViews = formatViewsMillion(viewsNum)

              const ArticleCard = (
                <article
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col card-hover-scale reveal focus-within:ring-2 focus-within:ring-[#c8ab3d] focus-within:ring-offset-2"
                  style={{ transitionDelay: `${index * 80}ms` }}
                  role="article"
                  aria-labelledby={`article-title-${index}`}
                  aria-describedby={postExcerpt ? `article-excerpt-${index}` : undefined}
                >
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                    {/* @ts-ignore - handling potential legacy data structure */}
                    {(post.mainImage?.asset?.url || (post.mainImage as any)?.url) ? (
                      <OptimizedImage
                        src={post.mainImage?.asset?.url || (post.mainImage as any)?.url || urlFor(post.mainImage!).width(800).height(560).quality(85).auto('format').url()}
                        alt={post.mainImage?.alt || `Featured image for ${postTitle}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={88}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                    ) : (post as any).mainImage ? (
                      <OptimizedImage
                        src={urlFor((post as any).mainImage).width(800).height(560).quality(85).auto('format').url()}
                        alt={(post as any).mainImage.alt || `Featured image for ${postTitle}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        quality={88}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
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
                        style={{ backgroundColor: getCategoryColor(displayCategory) }}
                        role="badge"
                        aria-label={`Category: ${categoryTitle}`}
                      >
                        {categoryTitle}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4
                      id={`article-title-${index}`}
                      className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#082945] transition-colors line-clamp-2"
                    >
                      {postTitle}
                    </h4>
                    {/* Tags suppressed; Latest Insights shows industry category badge only */}
                    {postExcerpt && (
                      <p
                        id={`article-excerpt-${index}`}
                        className="text-gray-600 mb-4 line-clamp-2 flex-1"
                      >
                        {postExcerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                      {writerName && (
                        <span className="font-medium" aria-label={`Writer: ${writerName}`}>
                          {writerName}
                        </span>
                      )}
                      <span className="flex items-center gap-1" aria-label={`Views: ${displayViews} million`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {displayViews}
                      </span>
                    </div>
                  </div>
                </article>
              )

              return isValidSlug ? (
                <Link
                  key={(post as any)._id}
                  href={(() => {
                    const categories = (post as any)?.categories || [];
                    const cat = (Array.isArray(categories) && categories.length > 0 && categories[0]?.slug?.current) || 'general';
                    return `/category/${cat}/${slug}`;
                  })()}
                  prefetch={false}
                  className="group bg-white focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 rounded-lg overflow-hidden shadow-md"
                  aria-label={`Read article: ${postTitle}${writerName ? ` by writer ${writerName}` : ''}`}
                >
                  {ArticleCard}
                </Link>
              ) : (
                <div
                  key={(post as any)._id}
                  className="group bg-white rounded-lg overflow-hidden shadow-md"
                  aria-disabled="true"
                  role="article"
                  aria-label={`Article unavailable: ${postTitle}`}
                >
                  {ArticleCard}
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            aria-busy="true"
            aria-label="Loading articles"
            role="status"
          >
            <span className="sr-only">Loading latest articles...</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Read More CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/archive"
            prefetch={false}
            className="inline-flex items-center px-6 py-3 bg-[#082945] text-white rounded-md hover:bg-[#0a3761] transition-colors font-semibold"
            aria-label="View all latest insights"
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  )
}
