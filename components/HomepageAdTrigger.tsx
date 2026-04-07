'use client'

import { useEffect, useRef } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { localeReady } from '@/lib/localeGate'
import type { PopupAd } from '@/lib/adInterstitial/constants'

const POPUP_DELAY = 10000 // 10 seconds

interface Props {
  ads: PopupAd[]
}

export default function HomepageAdTrigger({ ads }: Props) {
    const { triggerAd, hasTriggered } = useAdTrigger(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const isLocaleReady = () => {
        try {
            return localeReady()
        } catch (error) {
            console.warn('localeReady check failed, defaulting to true:', error)
            return true
        }
    }

    useEffect(() => {
        if (hasTriggered || ads.length === 0) return

        timerRef.current = setTimeout(() => {
            if (!hasTriggered && isLocaleReady()) {
                triggerAd(
                    ads.map((ad) => ({ image: ad.imageUrl, href: ad.targetUrl, title: ad.alt || '' }))
                )
            }
        }, POPUP_DELAY)

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [hasTriggered, triggerAd, ads])

    return null
}
