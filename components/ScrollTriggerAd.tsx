'use client'

import { useEffect, useRef } from 'react'
import { useAdStore } from '@/store/adStore'
import { ADS } from '@/lib/adInterstitial/constants'

export default function ScrollTriggerAd() {
    const { openAd, isOpen } = useAdStore()
    const hasTriggered = useRef<string[]>([])

    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) return

            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
            const scrollPercent = scrollTop / (docHeight - winHeight)

            if (scrollPercent > 0.5 && !hasTriggered.current.includes('carousel')) {
                hasTriggered.current.push('carousel')

                // Pass BOTH ads to the store to trigger the carousel
                openAd([
                    { image: ADS[0].imageUrl, href: ADS[0].targetUrl, title: ADS[0].alt || 'Sponsored' },
                    { image: ADS[1].imageUrl, href: ADS[1].targetUrl, title: ADS[1].alt || 'Sponsored' }
                ])
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [openAd, isOpen])

    return null
}
