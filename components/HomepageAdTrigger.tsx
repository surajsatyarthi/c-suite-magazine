'use client'

import { useEffect, useRef } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { ADS } from '@/lib/adInterstitial/constants'
import { localeReady } from '@/lib/localeGate'

const POPUP_DELAY = 10000 // 10 seconds

export default function HomepageAdTrigger() {
    // Homepage popup: Show up to 6 times per day (every 2 hours)
    const { triggerAd, hasTriggered } = useAdTrigger(false) // Use localStorage 2-hour cooldown
    const timerRef = useRef<NodeJS.Timeout | null>(null)

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
        if (hasTriggered) return

        // Show popup after 10 seconds of user staying on homepage
        timerRef.current = setTimeout(() => {
            // Only show ad if locale popup has been dismissed
            if (!hasTriggered && isLocaleReady()) {
                // Trigger the popup with both ads
                triggerAd([
                    { image: ADS[0].imageUrl, href: ADS[0].targetUrl, title: ADS[0].alt || 'Sponsored' },
                    { image: ADS[1].imageUrl, href: ADS[1].targetUrl, title: ADS[1].alt || 'Sponsored' }
                ])
            }
        }, POPUP_DELAY)

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [hasTriggered, triggerAd])

    return null
}
