/**
 * Hook to manage Ad Session state
 * Tracks eligibility, user interaction, and if ad has been shown
 */

import { useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function useAdSession() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const forceOpen = searchParams?.get('openAd') === '1'

    // Treat category article pages as eligible for interstitials
    const isCategoryArticle = !!pathname && /^\/category\/[^/]+\/[^/]+$/.test(pathname)
    const isTestPage = pathname === '/test-ad'
    const enabled = !!(forceOpen || isCategoryArticle || isTestPage)

    const [hasInteracted, setHasInteracted] = useState<boolean>(false)
    const shownRef = useRef(false)

    // Reset on route change
    useEffect(() => {
        if (!forceOpen) {
            shownRef.current = false
        }
    }, [pathname, forceOpen])

    // Track first meaningful user interaction
    useEffect(() => {
        const markInteracted = () => setHasInteracted(true)
        window.addEventListener('pointerdown', markInteracted, { once: true })
        window.addEventListener('keydown', markInteracted, { once: true })
        window.addEventListener('touchstart', markInteracted, { once: true })
        return () => {
            try { window.removeEventListener('pointerdown', markInteracted) } catch { }
            try { window.removeEventListener('keydown', markInteracted) } catch { }
            try { window.removeEventListener('touchstart', markInteracted) } catch { }
        }
    }, [])

    return {
        enabled,
        forceOpen,
        hasInteracted,
        shownRef, // Return ref so other hooks can check/set it
    }
}
