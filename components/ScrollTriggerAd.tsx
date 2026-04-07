'use client'

import { useEffect } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { SCROLL_THRESHOLD } from '@/lib/adInterstitial/constants'
import { localeReady } from '@/lib/localeGate'
import type { PopupAd } from '@/lib/adInterstitial/constants'

interface Props {
  ads: PopupAd[]
}

export default function ScrollTriggerAd({ ads }: Props) {
    const { triggerAd, hasTriggered } = useAdTrigger(false)

    const isLocaleReady = () => {
        try {
            return localeReady()
        } catch (error) {
            console.warn('localeReady check failed, defaulting to true:', error)
            return true
        }
    }

    useEffect(() => {
        if (ads.length === 0) return

        const timer = setTimeout(() => {
            let lastScrollTime = 0
            const handleScroll = () => {
                const now = Date.now()
                if (now - lastScrollTime < 200) return
                lastScrollTime = now

                if (hasTriggered) return

                const scrollTop = window.scrollY
                const docHeight = document.documentElement.scrollHeight
                const winHeight = window.innerHeight

                if (docHeight <= winHeight) return

                const scrollPercent = scrollTop / (docHeight - winHeight)

                if (scrollPercent > SCROLL_THRESHOLD && isLocaleReady()) {
                    triggerAd(
                        ads.map((ad) => ({ image: ad.imageUrl, href: ad.targetUrl, title: ad.alt || '' }))
                    )
                }
            }

            window.addEventListener('scroll', handleScroll, { passive: true })
            handleScroll()

            return () => window.removeEventListener('scroll', handleScroll)
        }, 1000)

        return () => clearTimeout(timer)
    }, [triggerAd, hasTriggered, ads])

    return null
}
