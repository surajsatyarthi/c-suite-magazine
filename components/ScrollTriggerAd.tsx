'use client'

import { useEffect } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { ADS, SCROLL_THRESHOLD } from '@/lib/adInterstitial/constants'

export default function ScrollTriggerAd() {
    const { triggerAd, hasTriggered } = useAdTrigger()

    useEffect(() => {
        const handleScroll = () => {
            if (hasTriggered) return

            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
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
        return () => window.removeEventListener('scroll', handleScroll)
    }, [triggerAd, hasTriggered])

    return null
}


