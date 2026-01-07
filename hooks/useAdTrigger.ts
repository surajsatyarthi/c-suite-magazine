import { useCallback, useRef } from 'react'
import { useAdStore, AdContent } from '@/store/adStore'

const SESSION_KEY = 'popup-ad-shown-session'

/**
 * Hook for triggering popup ads
 * @param skipSessionCheck - If true, skips session check and only uses localStorage cooldown (for article popups)
 */
export function useAdTrigger(skipSessionCheck = false) {
    const { openAd, isOpen } = useAdStore()
    const hasTriggered = useRef(false)

    const triggerAd = useCallback((content: AdContent | AdContent[]) => {
        if (hasTriggered.current || isOpen) return

        // Check if popup already shown this session (only for homepage, not articles)
        if (!skipSessionCheck && typeof window !== 'undefined') {
            const hasShownThisSession = sessionStorage.getItem(SESSION_KEY)
            if (hasShownThisSession) return
            sessionStorage.setItem(SESSION_KEY, '1')
        }

        hasTriggered.current = true
        // CSA sponsors paid for popup - skip cooldown
        openAd(content, skipSessionCheck) // skipSessionCheck = skipCooldown for consistency
    }, [isOpen, openAd, skipSessionCheck])

    return { triggerAd, hasTriggered: hasTriggered.current }
}
