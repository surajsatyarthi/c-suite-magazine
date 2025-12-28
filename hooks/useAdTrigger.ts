import { useCallback, useRef } from 'react'
import { useAdStore, AdContent } from '@/store/adStore'

const SESSION_KEY = 'popup-ad-shown-session'

export function useAdTrigger() {
    const { openAd, isOpen } = useAdStore()
    const hasTriggered = useRef(false)

    const triggerAd = useCallback((content: AdContent | AdContent[]) => {
        if (hasTriggered.current || isOpen) return

        // Check if popup already shown this session
        if (typeof window !== 'undefined') {
            const hasShownThisSession = sessionStorage.getItem(SESSION_KEY)
            if (hasShownThisSession) return
            sessionStorage.setItem(SESSION_KEY, '1')
        }

        hasTriggered.current = true
        openAd(content)
    }, [isOpen, openAd])

    return { triggerAd, hasTriggered: hasTriggered.current }
}
