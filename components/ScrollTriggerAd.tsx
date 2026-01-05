'use client'

import { useEffect, useRef } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { ADS, SCROLL_THRESHOLD } from '@/lib/adInterstitial/constants'
import { getPopupVariant, trackVariant } from '@/lib/ab-testing'

export default function ScrollTriggerAd() {
    // Skip session check for articles - only use 1-hour localStorage cooldown
    const { triggerAd, hasTriggered } = useAdTrigger(true)
    const hasCheckedVariant = useRef(false)

    useEffect(() => {
        // Only proceed if user is in the 'article' variant
        if (!hasCheckedVariant.current) {
            const variant = getPopupVariant()
            hasCheckedVariant.current = true

            if (variant !== 'article') {
                // User is in homepage variant, don't trigger on article pages
                return
            }
        }

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
                    // Track that this is the article variant
                    trackVariant('article')

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


