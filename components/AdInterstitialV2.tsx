'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { useAdStore } from '@/store/adStore'
import { usePathname } from 'next/navigation'

import { ADS } from '@/lib/adInterstitial/constants'

export default function AdInterstitialV2() {
    const { isOpen, content, closeAd, openAd, reset } = useAdStore()
    const pathname = usePathname()

    // Determine if CSA based on URL path (same logic as legacy)
    const categoryFromPath = pathname?.split('/')[2] || ''
    const isCompanySponsored = /^(company-sponsored)$/i.test(categoryFromPath)

    // Reset store on route change to avoid stale ads
    useEffect(() => {
        reset()
    }, [pathname, reset])

    const handleClose = () => {
        // Sequential Logic: If Normal Article AND showing Patek (first ad), switch to Gulfstream
        if (!isCompanySponsored && content?.href === ADS[0].targetUrl) {
            openAd({
                image: ADS[1].imageUrl,
                href: ADS[1].targetUrl,
                title: ADS[1].alt || 'Sponsored'
            })
            return
        }
        closeAd()
    }

    if (!isOpen || !content) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white/5 rounded-2xl shadow-2xl shadow-black/50 border border-white/10 max-w-md w-full mx-4 overflow-hidden transform transition-all scale-100">
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20 backdrop-blur-md"
                    aria-label="Close ad"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative w-full aspect-[4/5] md:aspect-[3/4]">
                    <Link
                        href={content.href || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                        onClick={closeAd} // Close on click? Or keep open? Usually close.
                    >
                        <OptimizedImage
                            src={content.image}
                            alt={content.title || 'Advertisement'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 400px"
                            priority
                        />
                        {/* Optional: "Sponsored" label */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs text-center opacity-70">
                            Advertisement
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
