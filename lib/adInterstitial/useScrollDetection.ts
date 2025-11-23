/**
 * Hook to detect scroll position and trigger ad reveal
 * Handles scroll events, mutation observers, and image loading
 */

import { useEffect, useRef } from 'react'
import { isPopupPresentInDOM } from '@/lib/localeGate'

type UseScrollDetectionProps = {
    enabled: boolean
    localeReady: boolean
    hasInteracted: boolean
    forceOpen: boolean
    shownRef: React.MutableRefObject<boolean>
    onTrigger: () => void
    onDebug?: (state: any) => void
}

export function useScrollDetection({
    enabled,
    localeReady,
    hasInteracted,
    forceOpen,
    shownRef,
    onTrigger,
    onDebug
}: UseScrollDetectionProps) {
    const cachedArticleElRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (!enabled) return

        const reveal = () => {
            // Hard gate: do not reveal the FIRST ad until locale popup is dismissed
            if (!localeReady) return
            // Require a user interaction before first reveal (unless force-open)
            if (!hasInteracted && !forceOpen) return
            // Safety net: if popup is present in DOM or marked open, bail
            if (isPopupPresentInDOM()) return
            if (shownRef.current) return

            onTrigger()
        }

        // Cached article element to avoid repeated DOM queries
        const getArticleEl = () => {
            if (!cachedArticleElRef.current) {
                cachedArticleElRef.current = document.querySelector('.prose.prose-lg') as HTMLElement | null
            }
            return cachedArticleElRef.current
        }

        // Optimized passedHalf calculation with reduced DOM access
        const passedHalf = () => {
            const el = getArticleEl()
            const vh = window.innerHeight
            const scrollY = window.scrollY
            const viewportBottom = scrollY + vh

            if (el) {
                // Use cached values where possible
                const rect = el.getBoundingClientRect()
                const topAbs = rect.top + scrollY
                const h = rect.height
                if (h <= 0) return false
                return (viewportBottom - topAbs) / h >= 0.5
            } else {
                // Fallback to document-based calculation
                const docH = document.documentElement.scrollHeight - vh
                return docH > 0 ? (scrollY / docH) >= 0.5 : false
            }
        }

        // Throttled scroll handler to reduce frequency
        let scrollTimeout: NodeJS.Timeout | null = null
        const onScroll = () => {
            if (shownRef.current) return
            if (scrollTimeout) return // Skip if already scheduled

            scrollTimeout = setTimeout(() => {
                scrollTimeout = null
                const half = passedHalf()
                if (onDebug) {
                    onDebug({
                        popupInDom: isPopupPresentInDOM(),
                        passedHalf: half,
                        scrollY: window.scrollY
                    })
                }
                if (half) reveal()
            }, 50) // Throttle to 50ms for smooth performance
        }

        // Throttled MutationObserver to reduce CPU usage
        let mutationTimeout: NodeJS.Timeout | null = null
        const throttledMutationCallback = () => {
            if (shownRef.current) return
            if (mutationTimeout) return // Skip if already scheduled

            mutationTimeout = setTimeout(() => {
                mutationTimeout = null
                if (passedHalf()) reveal()
            }, 100) // Throttle to 100ms
        }

        const mo = new MutationObserver(throttledMutationCallback)

        // Optimized image listeners with deduplication
        const imgListeners: Array<{ img: HTMLImageElement; handler: () => void }> = []
        const processedImages = new WeakSet<HTMLImageElement>()

        const attachImageListeners = () => {
            const el = getArticleEl()
            if (!el) return
            const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[]

            for (const img of imgs) {
                if (processedImages.has(img)) continue // Skip already processed images

                const handler = () => {
                    if (!shownRef.current && passedHalf()) reveal()
                }
                img.addEventListener('load', handler)
                imgListeners.push({ img, handler })
                processedImages.add(img) // Mark as processed
            }
        }

        // Kickoff
        window.addEventListener('scroll', onScroll, { passive: true })
        const el = getArticleEl()
        if (el) mo.observe(el, { childList: true, subtree: true })
        attachImageListeners()

        // Consolidated settling checks using RAF-based scheduling
        let checkCount = 0
        const maxChecks = 4
        const delays = [0, 600, 1800, 3500] // ms delays for each check

        const scheduleNextCheck = () => {
            if (checkCount >= maxChecks) return
            const delay = delays[checkCount]
            checkCount++

            if (delay === 0) {
                requestAnimationFrame(onScroll)
            } else {
                setTimeout(() => {
                    onScroll()
                    scheduleNextCheck()
                }, delay)
            }
        }

        try {
            scheduleNextCheck()
        } catch { }

        // Force open for QA still respects locale gating site-wide
        if (forceOpen && localeReady && !isPopupPresentInDOM()) {
            reveal()
        }

        // NEW: If we just became ready (e.g. user dismissed popup), check immediately
        // This fixes the race condition where user dismisses popup but ad doesn't show until next scroll
        if (localeReady && !shownRef.current && !isPopupPresentInDOM()) {
            // Trigger a check immediately
            onScroll()
        }

        return () => {
            try { window.removeEventListener('scroll', onScroll) } catch { }
            try { mo.disconnect() } catch { }
            if (imgListeners.length) {
                for (const { img, handler } of imgListeners) {
                    img.removeEventListener('load', handler)
                }
            }
            if (mutationTimeout) clearTimeout(mutationTimeout)
            if (scrollTimeout) clearTimeout(scrollTimeout)
        }
    }, [enabled, localeReady, hasInteracted, forceOpen, shownRef, onTrigger])
}
