'use client'

import { useEffect } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { ADS, SCROLL_THRESHOLD } from '@/lib/adInterstitial/constants'

export default function ScrollTriggerAd() {
    const { triggerAd, hasTriggered } = useAdTrigger()

    useEffect(() => {
        // Add a small delay to allow content to load and layout to settle
        const timer = setTimeout(() => {
            const handleScroll = () => {
                if (hasTriggered) return

                const scrollTop = window.scrollY
                const docHeight = document.documentElement.scrollHeight
                const winHeight = window.innerHeight

                // Prevent trigger if page is not scrollable or very short
                if (docHeight <= winHeight) return

                const scrollPercent = scrollTop / (docHeight - winHeight)

                if (scrollPercent > SCROLL_THRESHOLD) {
                    // Pass BOTH ads to the store to trigger the carousel
                    triggerAd([
                        { image: ADS[0].imageUrl, href: ADS[0].targetUrl, title: ADS[0].alt || 'Sponsored' },
                        { image: ADS[1].imageUrl, href: ADS[1].targetUrl, title: ADS[1].alt || 'Sponsored' }
                    ])
                }
            }

            window.addEventListener('scroll', handleScroll, { passive: true })

            // Initial check in case we are already scrolled (e.g. reload)
            handleScroll()

            return () => window.removeEventListener('scroll', handleScroll)
        }, 1000) // 1 second delay

        return () => clearTimeout(timer)
    }, [triggerAd, hasTriggered])

    return null
}


