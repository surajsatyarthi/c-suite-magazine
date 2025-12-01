'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { useAdStore } from '@/store/adStore'
import { usePathname } from 'next/navigation'

import { ADS } from '@/lib/adInterstitial/constants'

export default function AdInterstitialV2() {
    const { isOpen, content, closeAd, reset } = useAdStore()
    const pathname = usePathname()
    const [currentIndex, setCurrentIndex] = useState(0)

    // Reset store on route change to avoid stale ads
    useEffect(() => {
        reset()
        setCurrentIndex(0)
    }, [pathname, reset])

    // Auto-advance carousel if multiple ads
    useEffect(() => {
        if (!isOpen || !content || content.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % content.length)
        }, 5000) // Rotate every 5 seconds

        return () => clearInterval(timer)
    }, [isOpen, content])

    const handleClose = () => {
        closeAd()
        setCurrentIndex(0)
    }

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (content) {
            setCurrentIndex((prev) => (prev + 1) % content.length)
        }
    }

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (content) {
            setCurrentIndex((prev) => (prev - 1 + content.length) % content.length)
        }
    }

    if (!isOpen || !content || content.length === 0) return null

    const currentAd = content[currentIndex]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white/5 rounded-2xl shadow-2xl shadow-black/50 border border-white/10 max-w-4xl w-auto mx-4 overflow-hidden transform transition-all scale-100 flex flex-col">
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-20 backdrop-blur-md"
                    aria-label="Close ad"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative w-full h-auto max-h-[80vh] overflow-y-auto group">
                    <Link
                        href={currentAd.href || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                        onClick={closeAd}
                    >
                        {/* Use standard img for intrinsic sizing to avoid fixed aspect ratio constraints */}
                        <img
                            src={currentAd.image}
                            alt={currentAd.title || 'Advertisement'}
                            className="w-full h-auto object-contain max-h-[80vh] transition-opacity duration-500"
                        />
                        {/* Optional: "Sponsored" label */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs text-center opacity-70">
                            Advertisement {content.length > 1 && `(${currentIndex + 1}/${content.length})`}
                        </div>
                    </Link>

                    {/* Carousel Controls */}
                    {content.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Previous ad"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Next ad"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* Dots */}
                            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-10">
                                {content.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setCurrentIndex(idx)
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                        aria-label={`Go to ad ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
