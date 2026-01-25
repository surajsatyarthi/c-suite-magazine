'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { getArticleUrl } from '@/lib/urls'
import Pagination from '@/components/Pagination'
import { urlFor } from '@/lib/sanity'
import { Post } from '@/lib/types'
import { getViews, formatViewsMillion } from '@/lib/views'

interface CategoryClientProps {
    posts: Post[]
    category: {
        title: string
        slug: { current: string }
        description?: string
        color?: string
    }
}

export default function CategoryClient({ posts, category }: CategoryClientProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 21  // 3x7 grid layout

    // Industry Juggernaut slugs (high-value content, rarely changes)
    const juggernautSlugs = [
        'elon-musk-building-future-civilization-scale',
        'ratan-tata-legacy-ethical-leadership',
        'bhavesh-aggarwal-india-electric-ai-maverick',
        'ritesh-agarwal-billion-dollar-hostel-kid-rewrote-global-hospitality',
        'amin-nasser-steady-hand-guiding-energy-next-chapter',
        'chamath-palihapitiya-spac-king-climate-tech-rebel',
        'yi-he-village-roots-co-ceo-crypto-global-gateway',
        'mohamed-alabbar-dubai-master-builder-urban-innovation',
        'murray-auchincloss-pragmatic-reset-steering-bp-value'
    ]

    // CSA article slugs (paid content, must be visible)
    const csaSlugs = [
        'rich-stinson-ceo-southwire',
        'stella-ambrose-deputy-ceo-sawit-kinabalu',
        'shrikant-vaidya-chairman-indianoil'
    ]

    // Prioritize juggernauts and CSAs on CXO Interview category
    const sortedPosts = useMemo(() => {
        try {
            // Only sort for CXO Interview category
            if (category.slug.current !== 'cxo-interview') {
                return posts
            }

            // Filter into priority groups
            const juggernauts = posts.filter(p =>
                p?.slug?.current &&
                juggernautSlugs.includes(p.slug.current)
            )
            const csas = posts.filter(p =>
                p?.slug?.current &&
                csaSlugs.includes(p.slug.current)
            )
            const others = posts.filter(p =>
                p?.slug?.current &&
                !juggernautSlugs.includes(p.slug.current) &&
                !csaSlugs.includes(p.slug.current)
            )

            const sorted = [...juggernauts, ...csas, ...others]

            // Debug logging
            console.log('CategoryClient Debug:', {
                totalPosts: posts.length,
                sortedPosts: sorted.length,
                juggernauts: juggernauts.length,
                csas: csas.length,
                others: others.length,
                itemsPerPage: ITEMS_PER_PAGE,
                totalPages: Math.ceil(sorted.length / ITEMS_PER_PAGE)
            })

            return sorted
        } catch (error) {
            console.error('Sorting failed, using original order:', error)
            return posts  // Fallback to original
        }
    }, [posts, category.slug.current])

    // Read initial page from URL hash
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash
            const match = hash.match(/page=(\d+)/)
            if (match) {
                const page = parseInt(match[1], 10)
                if (page >= 1 && page <= Math.ceil(sortedPosts.length / ITEMS_PER_PAGE)) {
                    setCurrentPage(page)
                }
            }
        }
    }, [sortedPosts.length])

    // Calculate paginated posts
    const paginatedPosts = sortedPosts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <>
            {/* Articles Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {sortedPosts.length === 0 ? (
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
                            className="inline-block px-6 py-3 bg-[#082945] text-white rounded-lg hover:bg-[#0a3a5c] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                        >
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {paginatedPosts.map((post) => (
                                <Link
                                    key={post._id}
                                    href={getArticleUrl(post)}
                                    prefetch={false}
                                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                                >
                                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                                        {post.mainImage ? (
                                            <OptimizedImage
                                                src={urlFor(post.mainImage).width(800).height(560).quality(88).auto('format').url()}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                                            <span className="font-medium">{(post as any).writer?.name}</span>
                                            {(() => {
                                                const slug = (post as any)?.slug?.current || (post as any)?.slug
                                                const v = getViews(slug, (post as any)?.views)
                                                const formatted = formatViewsMillion(v, slug)
                                                return formatted && !post.hideViews ? (
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        {formatted}
                                                    </span>
                                                ) : null
                                            })()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            totalItems={sortedPosts.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </>
    )
}
