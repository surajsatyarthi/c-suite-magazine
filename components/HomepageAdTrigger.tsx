'use client'

import { useEffect, useRef } from 'react'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { ADS } from '@/lib/adInterstitial/constants'
import { getPopupVariant, trackVariant } from '@/lib/ab-testing'

const FALLBACK_DELAY = 20000 // 20 seconds
const VISIBILITY_THRESHOLD = 0.5 // 50% of section must be visible

export default function HomepageAdTrigger() {
    const { triggerAd, hasTriggered } = useAdTrigger()
    const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null)
    const hasCheckedVariant = useRef(false)

    useEffect(() => {
        // Only proceed if user is in the 'homepage' variant
        if (!hasCheckedVariant.current) {
            const variant = getPopupVariant()
            hasCheckedVariant.current = true

            if (variant !== 'homepage') {
                // User is in article variant, don't trigger on homepage
                return
            }
        }

        if (hasTriggered) return

        const targetSection = document.getElementById('csuite-spotlight')

        // Fallback: Show popup after 20 seconds if user hasn't scrolled to Spotlight
        fallbackTimerRef.current = setTimeout(() => {
            if (!hasTriggered) {
                triggerPopup()
            }
        }, FALLBACK_DELAY)

        // Primary trigger: Intersection Observer for Spotlight section
        if (targetSection) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting && entry.intersectionRatio >= VISIBILITY_THRESHOLD) {
                            if (!hasTriggered) {
                                triggerPopup()
                            }
                        }
                    })
                },
                {
                    threshold: VISIBILITY_THRESHOLD,
                    rootMargin: '0px',
                }
            )

            observer.observe(targetSection)

            return () => {
                observer.disconnect()
                if (fallbackTimerRef.current) {
                    clearTimeout(fallbackTimerRef.current)
                }
            }
        }

        return () => {
            if (fallbackTimerRef.current) {
                clearTimeout(fallbackTimerRef.current)
            }
        }
    }, [hasTriggered, triggerAd])

    const triggerPopup = () => {
        // Clear fallback timer if scroll trigger fired first
        if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current)
        }

        // Track that this is the homepage variant
        trackVariant('homepage')

        // Trigger the popup with both ads
        triggerAd([
            { image: ADS[0].imageUrl, href: ADS[0].targetUrl, title: ADS[0].alt || 'Sponsored' },
            { image: ADS[1].imageUrl, href: ADS[1].targetUrl, title: ADS[1].alt || 'Sponsored' }
        ])
    }

    return null
}
