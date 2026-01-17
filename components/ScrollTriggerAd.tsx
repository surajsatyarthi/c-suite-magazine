'use client'

import { useEffect } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { ADS, SCROLL_THRESHOLD } from '@/lib/adInterstitial/constants'
import { localeReady } from '@/lib/localeGate'

export default function ScrollTriggerAd() {
    // Regular article popup: Once per browser session (until tab closes)
    const { triggerAd, hasTriggered } = useAdTrigger(false) // Use sessionStorage

    // Fail-safe wrapper for localeReady check
    const isLocaleReady = () => {
        try {
            return localeReady()
        } catch (error) {
            console.warn('localeReady check failed, defaulting to true:', error)
            return true // Fail-safe: show ad if check fails
        }
    }

    useEffect(() => {
        // Add a small delay to allow content to load and layout to settle
        const timer = setTimeout(() => {
            let lastScrollTime = 0
            const handleScroll = () => {
                const now = Date.now()
                if (now - lastScrollTime < 200) return // Throttle to 200ms
                lastScrollTime = now

                if (hasTriggered) return

                const scrollTop = window.scrollY
                const docHeight = document.documentElement.scrollHeight
                const winHeight = window.innerHeight

                // Prevent trigger if page is not scrollable or very short
                if (docHeight <= winHeight) return

                const scrollPercent = scrollTop / (docHeight - winHeight)

                // Only show ad if locale popup has been dismissed
                if (scrollPercent > SCROLL_THRESHOLD && isLocaleReady()) {
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


