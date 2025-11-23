import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import OptimizedImage from '@/components/OptimizedImage'
import CXOOptimizedImage from '@/components/CXOOptimizedImage'
import fs from 'fs'
import path from 'path'
import dynamic from 'next/dynamic'
const ArticleProgress = dynamic(() => import('@/components/ArticleProgress'))
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import Footer from '@/components/Footer'
// dynamic already imported above
import Ad from '@/components/Ad'
import SocialShare from '@/components/SocialShare'
import PortableBody from '@/components/PortableBody'
// View tracking disabled per marketing policy
import { client, urlFor } from '@/lib/sanity'
import { getViews, formatViewsMillion } from '@/lib/views'
import { sanitizeExcerpt, sanitizeTitle } from '@/lib/text'
import { Post } from '@/lib/types'
import { generateMetadata as generateSEOMetadata, generateStructuredData } from '@/lib/seo'
import TagChips from '@/components/TagChips'
import IncrementViews from '@/components/IncrementViews'
import { getHeroAspectRatio } from '@/lib/heroAspects'

function getDefaultWriterFromCsv() {
  try {
    const csvPath = path.join(process.cwd(), 'tmp-writers.csv')
    const raw = fs.readFileSync(csvPath, 'utf8').trim()
    const [headerLine, ...rows] = raw.split(/\r?\n/)
    if (!rows.length) return null
    const headers = headerLine.split(',').map(h => h.trim())
    const first = rows[0].split(',').map(c => c.trim())
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = first[i] })
    if (!obj.slug || !obj.name) return null
    return { name: obj.name, slug: { current: obj.slug } }
  } catch {
    return null
  }
}

async function fetchWriterBySlug(slug: string) {
  try {
    const q = `*[_type == "writer" && slug.current == $slug][0]{
      name,
      slug,
      position,
      image,
      "imageUrl": image.asset->url,
      bio
    }`
    const doc = await client.fetch(q, { slug })
    return doc || null
  } catch {
    return null
  }
}

async function getPost(slug: string): Promise<Post | null> {
  console.log(`[getPost] Fetching article: ${slug}`)
  const query = `*[_type in ["post","article"] && (slug.current == $slug || slug == $slug) && isHidden != true][0] {
    _id,
    title,
    slug,
    excerpt,
    "writer": writer->{name, slug, position, image, "imageUrl": image.asset->url},
    mainImage{
      ..., 
      asset->{
        url,
        metadata{dimensions{aspectRatio, width, height}}
      }
    },
    "categories": categories[]->{title, slug, color},
    tags,
    contentPillar,
    views,
    body,
    seo
  }`
  try {
    const p = await client.fetch(query, { slug })
    if (p) {
      console.log(`[getPost] Found article: ${p.title}`)
      // Deterministic display-only fallback to approved writer list when missing.
      if (!p.writer) {
        const fallback = getDefaultWriterFromCsv()
        if (fallback) {
          const full = await fetchWriterBySlug(fallback.slug.current)
            ; (p as any).writer = full || fallback
        }
      }
      // Filter out potential null categories from broken references
      if (Array.isArray(p.categories)) {
        console.log(`[getPost] Categories before filter:`, JSON.stringify(p.categories))
        p.categories = p.categories.filter((c: any) => c !== null)
        console.log(`[getPost] Categories after filter:`, JSON.stringify(p.categories))
      }
      return p
    } else {
      console.log(`[getPost] Article not found in Sanity: ${slug}`)
    }
  } catch (e) {
    console.error(`[getPost] Error fetching article ${slug}:`, e)
  }
  try {
    const fallback = await getPostFromExports(slug)
    if (fallback) return fallback
  } catch {
  }
  // Do NOT fall back to getPostStub here blindly.
  // getPostStub should only be used if we are sure it's a legacy/stub page.
  return null
}

async function getPostFromExports(slug: string): Promise<Post | null> {
  try {
    const filePath = path.join(process.cwd(), 'exports', 'posts', `${slug}.json`)
    const raw = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(raw)
    const writerName = (data?.writer?.name) || (data?.author?.name) || String(data?.title || '').trim() || ''
    const writerSlug = (data?.writerSlug) || (data?.writer?.slug?.current) || (data?.author?.slug?.current) || slug
    const writer = writerName
      ? { name: writerName, slug: { current: writerSlug } }
      : undefined
    const categories = Array.isArray(data?.categories)
      ? data.categories.map((c: any) => ({ title: c?.title || String(c?.slug || ''), slug: { current: c?.slug?.current || c?.slug || 'general' } }))
      : []

    let mainImage = data?.mainImage
    if (!mainImage) {
      const hero = resolveFeaturedHeroImage({ writer, slug: { current: slug }, title: data?.title })
      if (hero) {
        const webp = hero.replace(/\.(png|jpg|jpeg)$/i, '.webp')
        mainImage = { asset: { url: webp }, alt: data?.title || 'Featured image' }
      }
    }

    const assembled: any = {
      _id: data?._id || slug,
      title: data?.title || slug,
      slug: { current: slug },
      excerpt: data?.excerpt || null,
      writer,
      categories,
      mainImage,
      tags: data?.tags || [],
      views: data?.views,
      body: Array.isArray(data?.body) ? data.body : [],
      seo: data?.seo || undefined,
      publishedAt: data?.publishedAt,
    }
    return assembled as Post
  } catch {
    return null
  }
}

async function getPostStub(slug: string, categorySlug?: string): Promise<Post | null> {
  try {
    // Only use Featured hero images for CXO interview articles
    const isCXO = categorySlug === 'cxo-interview' || categorySlug === 'cxo-spotlight';

    let hero = null;
    if (isCXO) {
      hero = resolveFeaturedHeroImage({ slug: { current: slug }, title: slug })
      if (!hero) {
        const section = resolveFeaturedSectionImage({ slug: { current: slug }, title: slug })
        if (section) hero = section
      }
    }

    if (!hero) return null

    const base = hero.split('/').pop() || slug
    const nameRaw = base.replace(/\.(png|jpg|jpeg|webp)$/i, '')
    const name = nameRaw.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
    const webp = hero.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    const mainImage = { asset: { url: webp }, alt: name }
    const assembled: any = {
      _id: slug,
      title: name || slug,
      slug: { current: slug },
      excerpt: null,
      writer: { name, slug: { current: slug } },
      categories: [{ title: 'CXO Interview', slug: { current: 'cxo-interview' } }],
      mainImage,
      tags: [],
      views: undefined,
      body: [],
      seo: undefined,
      publishedAt: undefined,
    }
    return assembled as Post
  } catch {
    return null
  }
}

async function getRelatedPosts(
  currentPostId: string,
  currentSlug: string,
  categorySlug?: string,
  contentPillar?: string,
  tags?: string[]
): Promise<Post[]> {
  const query = `*[_type == "post"
    && _id != $currentPostId
    && slug.current != $currentSlug
    && isHidden != true
    && defined(mainImage.asset)
    && !(title match "*rtf*" || title match "*cocoartf*" || writer->name match "*rtf*" || writer->name match "*cocoartf*")
  ] | score(
    contentPillar == $pillar && defined($pillar) => 3,
    $categorySlug in categories[]->slug.current => 2,
    count(tags[@ in $tags]) > 0 => 1
  ) | order(_score desc, publishedAt desc) [0...4] {
    _id,
    title,
    slug,
    "writer": writer->{name},
    mainImage,
    readTime,
    "categories": categories[]->{title, slug},
    _score
  }`
  try {
    return await client.fetch(query, {
      currentPostId,
      currentSlug,
      categorySlug: categorySlug || null,
      pillar: contentPillar || null,
      tags: tags || []
    })
  } catch (e) {
    return []
  }
}


async function getTrendingPosts(): Promise<Pick<Post, '_id' | 'title' | 'slug' | 'views'>[]> {
  // Prioritize Spotlight items (CXO Interviews) as requested
  const spotlightQuery = `*[_id == "spotlightConfig"][0].items[]->{
    _id,
    title,
    slug,
    views,
    "categories": categories[]->{title, slug}
  }[0...5]`

  // Fallback to views if spotlight is empty
  const fallbackQuery = `*[_type == "post" && defined(views) && isHidden != true] | order(views desc)[0...5] {
    _id,
    title,
    slug,
    views,
    "categories": categories[]->{title, slug}
  }`

  try {
    const spotlight = await client.fetch(spotlightQuery)
    if (spotlight && spotlight.length > 0) {
      return spotlight
    }
    return await client.fetch(fallbackQuery)
  } catch (e) {
    return []
  }
}

export const revalidate = 600

const heroAspectCache = new Map<string, number>()

export default async function CategoryArticlePage(props: { params: Promise<{ slug: string, article: string }> }) {
  try {
    const params = await props.params
    const { slug: categorySlug, article } = params || { slug: '', article: '' }
    let post: any = await getPost(article)

    if (post) {
      // console.log(`[CategoryArticlePage] Post categories:`, JSON.stringify(post.categories))
    }

    const isCXOInterview = String(categorySlug) === 'cxo-interview'
    const isSpotlight = Array.isArray(post?.categories)
      ? post.categories.some((c: any) => /spotlight|cxo[-_ ]?spotlight/i.test(String(c?.slug?.current || '')) || /spotlight/i.test(String(c?.title || '')))
      : false

    if (!post) {
      const stub = await getPostStub(article, categorySlug)
      if (!stub) {
        notFound()
      }
      post = stub as any
    }

    let relatedPosts = await getRelatedPosts(
      (post as any)._id,
      (post as any)?.slug?.current || (post as any)?.slug,
      Array.isArray((post as any).categories) && (post as any).categories.length > 0 ? (post as any).categories[0]?.slug?.current : undefined,
      (post as any)?.contentPillar,
      (post as any)?.tags || []
    )
    if (Array.isArray(relatedPosts)) {
      relatedPosts = relatedPosts.filter((p: any) => p !== null)
    }

    let trendingPosts = await getTrendingPosts()
    if (Array.isArray(trendingPosts)) {
      trendingPosts = trendingPosts.filter((p: any) => p !== null)
    }
    const bodyText: string = typeof (post as any)?.body === 'string' ? (post as any).body : ''

    const sanitizeMarkdown = (raw?: string): string => {
      if (!raw) return ''
      return String(raw)
        .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/\*\*|__|\*|_/g, '')
        .replace(/^\s*#{1,6}\s+/gm, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
    }

    const slugify = (s: string) => String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    // Full headline display (no truncation per request)

    const headings = Array.isArray((post as any)?.body)
      ? ((post as any).body as any[])
        .filter(b => ['h2', 'h3'].includes(b?.style))
        .map((b: any) => ({ text: String(b?.children?.[0]?.text || ''), id: slugify(String(b?.children?.[0]?.text || '')) }))
      : []

    const wordCount = sanitizeMarkdown(bodyText || ((post as any)?.body?.[0]?.children?.[0]?.text || '')).split(/\s+/).filter(Boolean).length
    const readTime = Math.max(1, Math.round(wordCount / 200))

    // Only use Featured hero images for CXO interview articles
    const featuredHeroSrc = isCXOInterview || isSpotlight ? resolveFeaturedHeroImage(post) : null
    let featuredHeroAspect: number | null = null
    if (featuredHeroSrc) {
      featuredHeroAspect = 16 / 9
    }

    // Robust interview/Q&A detection, aligned with article/[slug]/page.tsx
    const detectInterviewMode = (p: any): boolean => {
      try {
        const cats = (p?.categories || [])
        const catTitles = cats.map((c: any) => String(c?.title || '').toLowerCase())
        const catSlugs = cats.map((c: any) => String(c?.slug?.current || '').toLowerCase())
        const categoryHint = catTitles.some((t: string) => /interview|q\s*&\s*a|q\s*and\s*a|conversation|fireside|in\s*conversation/.test(t))
          || catSlugs.some((s: string) => /(interview|cxo[-_ ]?interview)/.test(s))
        const blocks: any[] = Array.isArray(p?.body) ? (p.body as any[]) : []
        const sample = blocks
        const hasQAHeuristics = sample.some((b) => {
          if (!b || b._type !== 'block') return false
          const text = (b.children || []).map((c: any) => String(c?.text || '')).join(' ').trim()
          if (!text) return false
          if (/^q\s*:\s*/i.test(text)) return true
          if (/^([A-Z][a-z]+|Interviewer|Host|Moderator|CEO|CTO|CFO)\s*:\s+/.test(text)) return true
          if (text.endsWith('?') && text.length <= 180) return true
          if (/(.+?\?)(\s+.+)/.test(text)) return true
          return false
        })
        return categoryHint || hasQAHeuristics
      } catch {
        return false
      }
    }

    const interviewMode = detectInterviewMode(post)

    const firstBlockText = Array.isArray((post as any)?.body)
      ? (() => {
        const b = ((post as any).body as any[]).find((blk: any) => blk?._type === 'block')
        const text = Array.isArray(b?.children) ? b.children.map((c: any) => String(c?.text || '')).join(' ') : ''
        return text
      })()
      : ''
    const excerptPrimary = sanitizeExcerpt(post.excerpt || '', post.title)
    const excerptFallback = sanitizeExcerpt(firstBlockText || bodyText || '', post.title)
    const safeExcerpt = excerptPrimary || (excerptFallback ? excerptFallback.substring(0, 200) : '')

    // Strip duplicate title at the start of body when present
    const cleanedBody = Array.isArray((post as any)?.body)
      ? (() => {
        const blocks = ((post as any).body as any[]).slice()
        const norm = (s: string) => String(s || '')
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '')
          .toLowerCase()
          .trim()
        // Remove up to two duplicate title blocks near the top, skipping non-blocks
        let removed = 0
        for (let i = 0; i < blocks.length && removed < 2; i++) {
          const blk = blocks[i]
          if (!blk || blk._type !== 'block') continue
          const text = Array.isArray(blk?.children)
            ? blk.children.map((c: any) => String(c?.text || '')).join(' ')
            : ''
          if (norm(text).startsWith(norm(post.title))) {
            blocks.splice(i, 1)
            removed++
            i--
            continue
          }
          // Stop once we encounter the first non-duplicate block
          break
        }
        return blocks
      })()
      : (post as any)?.body

    return (
      <>
        <Navigation />

        <main className="bg-white">
          <IncrementViews slug={(post as any)?.slug?.current || (post as any)?.slug} />
          <ArticleProgress />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(generateStructuredData('article', {
                title: post.title,
                description: sanitizeExcerpt(post.excerpt || firstBlockText || bodyText || '')?.substring(0, 160) || undefined,
                image: (post as any)?.mainImage?.asset?.url || (post.mainImage ? urlFor(post.mainImage).auto('format').url() : undefined),
                publishedTime: post.publishedAt,
                writer: (post as any)?.writer?.name,
                url: `https://csuitemagazine.global/category/${categorySlug}/${(post as any)?.slug?.current}`,
                wordCount,
                readTime
              })),
            }}
          />
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              ...(post.categories && post.categories.length > 0 && post.categories[0]
                ? [{ label: post.categories[0].title, href: `/category/${post.categories[0].slug.current}` }]
                : []),
            ]}
          />

          <article className="py-8">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-none mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
                  <div>
                    <div className="mb-6">
                      <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 leading-tight tracking-tight">
                        {sanitizeTitle(post.title)}
                      </h1>
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <TagChips tags={post.tags} className="mt-3" size="sm" variant="blue" />
                      )}
                      {post.writer && (
                        <div className="flex items-center gap-3 mt-3" aria-label={`By ${post.writer.name}`}>
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                            {post.writer?.image ? (
                              <OptimizedImage
                                src={post.writer.imageUrl || urlFor(post.writer.image).width(128).height(128).auto('format').url()}
                                alt={post.writer.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#082945] text-white flex items-center justify-center">
                                <span className="text-xs font-semibold">
                                  {String(post.writer?.name || '')
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/writer/${post.writer.slug?.current || post.writer.slug}`}
                            className="font-sans text-sm font-medium text-[#082945] hover:text-[#0a3350] transition-colors"
                          >
                            By {post.writer.name}
                          </Link>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                        {/* Keep read time separate; do not attach writer name to it */}
                        <span>{readTime} min read</span>
                        {post.categories && post.categories.length > 0 && (
                          <span className="flex items-center gap-2">
                            <span aria-hidden>•</span>
                            <Link href={`/category/${post.categories[0].slug.current}`} className="font-medium text-[#082945] hover:text-[#0a3350] transition-colors">
                              {post.categories[0].title}
                            </Link>
                          </span>
                        )}
                        {/* Do not repeat writer attribution here; shown above with avatar */}
                        {/* Tags are rendered as chips under the heading */}
                      </div>

                      <SocialShare
                        url={`https://csuitemagazine.global/category/${categorySlug}/${(post as any)?.slug?.current}`}
                        title={post.title}
                      />
                    </div>


                    {(featuredHeroSrc || post.mainImage) && (
                      <div
                        className={'relative w-full rounded-lg overflow-hidden mb-10'}
                        style={(() => {
                          if (featuredHeroSrc) return { aspectRatio: featuredHeroAspect || 16 / 9 }
                          const meta = (post as any)?.mainImage?.asset?.metadata?.dimensions?.aspectRatio
                          return { aspectRatio: meta || 16 / 9 }
                        })()}
                      >
                        <CXOOptimizedImage
                          src={
                            (() => {
                              if (featuredHeroSrc) return featuredHeroSrc
                              return (post as any)?.mainImage?.asset?.url ||
                                urlFor(post.mainImage)
                                  .width(1600)
                                  .quality(95)
                                  .auto('format')
                                  .url()
                            })()
                          }
                          alt={(post as any)?.mainImage?.alt || post.title}
                          fill
                          className={'object-cover object-center'}
                          quality={95}
                          hero={true}
                          priority={true}
                          sizes={(() => {
                            return featuredHeroSrc
                              ? '(max-width: 768px) 95vw, (max-width: 1024px) 70vw, 1000px'
                              : '(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1280px'
                          })()}
                        />
                      </div>
                    )}

                    {/* Writer name suppressed below main image to avoid duplication */}

                    {/* Excerpt */}
                    {safeExcerpt && (
                      <p className="text-lg text-gray-700 leading-relaxed mb-6">
                        {safeExcerpt}
                      </p>
                    )}

                    {/* Body */}
                    <div className="prose prose-lg max-w-none">
                      <PortableBody value={cleanedBody} interviewMode={interviewMode} />
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Writer */}
                    {post.writer && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-serif text-base font-semibold text-gray-900 mb-4">Writer</h3>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                            {post.writer?.image ? (
                              <OptimizedImage
                                src={post.writer.imageUrl || urlFor(post.writer.image).width(256).height(256).auto('format').url()}
                                alt={post.writer.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-[#082945] text-white flex items-center justify-center">
                                <span className="text-sm font-semibold">
                                  {String(post.writer?.name || '')
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('')
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-serif text-sm font-medium text-gray-900">{post.writer.name}</div>
                            {post.writer?.position && (
                              <div className="text-xs text-gray-500">{post.writer.position}</div>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/writer/${post.writer.slug?.current || post.writer.slug}`}
                          prefetch
                          className="font-sans text-sm font-medium text-[#082945] hover:text-[#0a3350] transition-colors"
                        >
                          More from {post.writer.name} →
                        </Link>
                      </div>
                    )}


                    {/* Sidebar Ad (Vertical) */}
                    <div className="bg-transparent border border-gray-200/30 rounded-lg p-3">
                      <Ad placement="article-sidebar-large" />
                    </div>

                    {/* Related Articles */}
                    {relatedPosts.length > 0 && (
                      <div>
                        <h3 className="font-serif text-base font-semibold bg-[#082945] px-4 py-3 mb-4" style={{ color: '#ffffff' }}>
                          Related Articles
                        </h3>
                        <div className="space-y-6">
                          {relatedPosts.map((relatedPost) => (
                            <Link
                              key={relatedPost._id}
                              href={`/category/${(relatedPost as any)?.categories?.[0]?.slug?.current}/${relatedPost.slug.current}`}
                              prefetch
                              className="block group"
                            >
                              {relatedPost.mainImage && (
                                <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                                  <OptimizedImage
                                    src={urlFor(relatedPost.mainImage).width(400).height(300).auto('format').url()}
                                    alt={relatedPost.mainImage.alt || relatedPost.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                  />
                                </div>
                              )}
                              <h4 className="text-lg font-serif font-normal text-gray-900 group-hover:text-[#082945] transition-colors leading-snug mb-2">
                                {relatedPost.title}
                              </h4>
                              <div className="flex items-center text-sm text-gray-500 font-sans">
                                {(() => {
                                  const slug = (relatedPost as any)?.slug?.current || (relatedPost as any)?.slug
                                  const v = getViews(slug, (relatedPost as any)?.views)
                                  const formatted = formatViewsMillion(v)
                                  return formatted ? (
                                    <span className="flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      {formatted}
                                    </span>
                                  ) : null
                                })()}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending Now */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="font-serif text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#c8ab3d]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        Trending Now
                      </h3>
                      <div className="space-y-4">
                        {trendingPosts && trendingPosts.length > 0 ? (
                          trendingPosts.map((tp, idx) => {
                            const catSlug = String(((tp as any)?.categories?.[0]?.slug?.current ?? (tp as any)?.categories?.[0]?.slug ?? 'general'))
                            const postSlug = String(((tp as any)?.slug?.current ?? (tp as any)?.slug ?? ''))
                            const href = `/category/${catSlug}/${postSlug}`
                            const content = (
                              <div className="flex gap-3">
                                <span className="text-2xl font-bold text-[#c8ab3d] flex-shrink-0">{idx + 1}</span>
                                <div>
                                  <h4 className="font-sans text-sm font-medium !text-gray-900 group-hover:!text-[#c8ab3d] hover:!text-[#c8ab3d] transition-colors leading-snug mb-1">
                                    {tp.title}
                                  </h4>
                                </div>
                              </div>
                            )
                            return postSlug ? (
                              <Link key={tp._id} href={href} prefetch={false} className="block group">
                                {content}
                              </Link>
                            ) : (
                              <div key={tp._id} className="block group" aria-disabled="true">
                                {content}
                              </div>
                            )
                          })
                        ) : (
                          <p className="font-sans text-sm text-gray-500">No trending articles available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>

        <Footer />
      </>
    )
  } catch (e) {
    console.error('[CategoryArticlePage] Error rendering:', e)
    const { article, slug: categorySlug } = (await (arguments[0] as any)?.params) || { article: '', slug: '' }
    const stub = await getPostStub(String(article || ''), categorySlug)
    if (!stub) {
      notFound()
    }
    // resolveFeaturedHeroImage is already called inside getPostStub if applicable
    const featuredHeroSrc = stub?.mainImage?.asset?.url || null
    const featuredHeroAspect = featuredHeroSrc ? 16 / 9 : null
    return (
      <>
        <Navigation />
        <main className="bg-white">
          <ArticleProgress />
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'CXO Interview', href: `/category/${String(categorySlug || 'cxo-interview')}` },
            ]}
          />
          <article className="py-8">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-none mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 leading-tight tracking-tight">
                      {sanitizeTitle(stub.title)}
                    </h1>
                    {(featuredHeroSrc) && (
                      <div
                        className={'relative w-full rounded-lg overflow-hidden mb-10'}
                        style={{ aspectRatio: featuredHeroAspect || 16 / 9 }}
                      >
                        <CXOOptimizedImage
                          src={featuredHeroSrc}
                          alt={stub.title}
                          fill
                          className={'object-cover object-center'}
                          quality={95}
                          hero={true}
                          priority={true}
                          sizes={'(max-width: 768px) 95vw, (max-width: 1024px) 70vw, 1000px'}
                        />
                      </div>
                    )}
                    <div className="prose prose-lg max-w-none">
                      <PortableBody value={[]} interviewMode={false} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-transparent border border-gray-200/30 rounded-lg p-3">
                      <Ad placement="article-sidebar-large" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </main>
        <Footer />
      </>
    )
  }
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string, article: string }> }
): Promise<Metadata> {
  const params = await props.params
  const { article } = params || { article: '' }
  const post = await getPost(article)

  if (!post) {
    const fallback = (await getPostFromExports(article)) || (await getPostStub(article))
    if (!fallback) {
      return {
        title: 'Article not found — C-Suite Magazine',
        description: 'The requested article could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      }
    }
    return generateSEOMetadata({
      title: (fallback as any)?.seo?.metaTitle || (fallback as any)?.title,
      description:
        (fallback as any)?.excerpt || (fallback as any)?.body?.[0]?.children?.[0]?.text?.substring(0, 160) || undefined,
      keywords: (fallback as any)?.tags || [],
      image:
        (fallback as any)?.mainImage?.asset?.url ||
        ((fallback as any)?.mainImage ? urlFor((fallback as any).mainImage).auto('format').url() : undefined),
      type: 'article',
      publishedTime: (fallback as any)?.publishedAt,
      writer: (fallback as any)?.writer?.name,
      section: (fallback as any)?.categories?.[0]?.title,
    })
  }

  return generateSEOMetadata({
    title: (post as any)?.seo?.metaTitle || post.title,
    description: post.excerpt || post.body?.[0]?.children?.[0]?.text?.substring(0, 160) + '...',
    keywords: post.tags || [],
    image: (post as any)?.mainImage?.asset?.url || (post.mainImage ? urlFor(post.mainImage).auto('format').url() : undefined),
    type: 'article',
    publishedTime: post.publishedAt,
    writer: (post as any)?.writer?.name,
    section: post.categories?.[0]?.title,
  })
}
// Resolve public Featured hero image for CXO pages
function resolveFeaturedHeroImage(p: any): string | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'Featured hero')
    const files = fs.readdirSync(dir)
    const rawName = String(p?.writer?.name || '').trim()
    const rawSlug = String(p?.slug?.current || p?.slug || '').trim()
    const rawTitle = String(p?.title || '').trim()

    const normalize = (s: string) => s
      .toLowerCase()
      .replace(/\./g, '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ') // collapse whitespace
      .trim()

    const name = normalize(rawName)
    const slug = normalize(rawSlug)
    const title = normalize(rawTitle)

    // Prefer exact normalized matches first (avoids accidental partial includes)
    const normalizedMap = files.map((f) => ({
      file: f,
      base: f.replace(/\.(png|jpg|jpeg|webp)$/i, ''),
      norm: normalize(f.replace(/\.(png|jpg|jpeg|webp)$/i, '')),
    }))

    // 1) Exact matches on slug or writer name
    let match = normalizedMap.find((x) => x.norm === slug) || normalizedMap.find((x) => x.norm === name)

    // 2) Includes fallback (both directions) and subject name from title
    if (!match) {
      match =
        normalizedMap.find((x) => x.norm.includes(slug)) ||
        normalizedMap.find((x) => x.norm.includes(name)) ||
        normalizedMap.find((x) => slug.includes(x.norm)) ||
        normalizedMap.find((x) => name.includes(x.norm)) ||
        normalizedMap.find((x) => title.includes(x.norm))
    }

    if (!match) return null
    const baseNoExt = match.base
    const webpExact = files.find((f) => f.toLowerCase() === `${baseNoExt.toLowerCase()}.webp`)
    const chosen = webpExact || match.file
    return `/Featured hero/${chosen}`
  } catch {
    return null
  }
}

// Resolve public Featured section rectangular image for full articles
function resolveFeaturedSectionImage(p: any): string | null {
  try {
    const dir = path.join(process.cwd(), 'public', 'Featured section')
    const files = fs.readdirSync(dir)
    const rawName = String(p?.writer?.name || '').trim()
    const rawSlug = String(p?.slug?.current || p?.slug || '').trim()
    const rawTitle = String(p?.title || '').trim()

    const normalize = (s: string) => s
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    const name = normalize(rawName)
    const slug = normalize(rawSlug)
    const title = normalize(rawTitle)

    const normalizedMap = files.map((f) => ({
      file: f,
      base: f.replace(/\.(png|jpg|jpeg|webp)$/i, ''),
      norm: normalize(f.replace(/\.(png|jpg|jpeg|webp)$/i, '')),
    }))

    // Prefer exact normalized matches first
    let match = normalizedMap.find((x) => x.norm === slug) || normalizedMap.find((x) => x.norm === name)

    // Includes fallback (both directions) and subject name from title
    if (!match) {
      match =
        normalizedMap.find((x) => x.norm.includes(slug)) ||
        normalizedMap.find((x) => x.norm.includes(name)) ||
        normalizedMap.find((x) => slug.includes(x.norm)) ||
        normalizedMap.find((x) => name.includes(x.norm)) ||
        normalizedMap.find((x) => title.includes(x.norm))
    }

    if (!match) return null
    return `/Featured section/${match.file}`
  } catch {
    return null
  }
}
