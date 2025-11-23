'use client'

import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { usePathname } from 'next/navigation'
import { AD_LINK, ADS } from '@/lib/adInterstitial/constants'
import { useLocaleGate } from '@/lib/adInterstitial/useLocaleGate'
import { useAdSession } from '@/lib/adInterstitial/useAdSession'
import { useImagePreloader } from '@/lib/adInterstitial/useImagePreloader'
import { useScrollDetection } from '@/lib/adInterstitial/useScrollDetection'

/**
 * AdInterstitialV2 - Refactored version using custom hooks
 * 
 * Logic split into:
 * - useLocaleGate: Manages locale popup state
 * - useAdSession: Manages eligibility and interaction state
 * - useImagePreloader: Manages image loading and display state
 * - useScrollDetection: Manages scroll/mutation triggers
 */
export default function AdInterstitialV2() {
    const pathname = usePathname()
    const localeReady = useLocaleGate()
    const { enabled, forceOpen, hasInteracted, shownRef } = useAdSession()
    const { show, setShow, ad, adIndex, aspectRatio, loadAd } = useImagePreloader({
        shownRef,
        forceOpen,
        pathname
    })

    useScrollDetection({
        enabled,
        localeReady,
        hasInteracted,
        forceOpen,
        shownRef,
        onTrigger: () => loadAd(0)
    })

    if (!enabled || !show) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="relative bg-black/40 text-white rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/50 border border-white/10 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
                <button
                    onClick={() => {
                        if (adIndex === 0) {
                            // Switch to second ad instead of closing
                            loadAd(1)
                        } else {
                            setShow(false)
                        }
                    }}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors z-10"
                    aria-label="Close ad"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="p-6">
                    <Link href={ad?.targetUrl || AD_LINK} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
                        <div className="relative w-full rounded-xl overflow-hidden min-h-[220px]" style={{ aspectRatio }}>
                            <OptimizedImage
                                src={ad?.imageUrl || ADS[0].imageUrl}
                                alt={ad?.alt || 'Sponsored'}
                                fill
                                className="object-contain"
                                sizes="(max-width: 1024px) 100vw, 970px"
                                priority
                                decoding="async"
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
