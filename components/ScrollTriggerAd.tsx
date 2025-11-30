'use client'

import { useEffect, useRef } from 'react'
import { useAdStore } from '@/store/adStore'
import { ADS } from '@/lib/adInterstitial/constants'

export default function ScrollTriggerAd() {
    const { openAd, isOpen } = useAdStore()
    const hasTriggered = useRef(false)

    useEffect(() => {
        const handleScroll = () => {
            if (hasTriggered.current || isOpen) return

            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
            const scrollPercent = scrollTop / (docHeight - winHeight)

            if (scrollPercent > 0.5) {
                hasTriggered.current = true
                // Always start with Patek (Index 0) for normal articles
                const firstAd = ADS[0]

                openAd({
                    image: firstAd.imageUrl,
                    href: firstAd.targetUrl,
                    title: firstAd.alt || 'Sponsored'
                })
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [openAd, isOpen])

    return null
}
