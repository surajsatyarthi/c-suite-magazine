import { useCallback, useRef } from 'react'
import { useAdStore, AdContent } from '@/store/adStore'

export function useAdTrigger() {
    const { openAd, isOpen } = useAdStore()
    const hasTriggered = useRef(false)

    const triggerAd = useCallback((content: AdContent | AdContent[]) => {
        if (hasTriggered.current || isOpen) return

        hasTriggered.current = true
        openAd(content)
    }, [isOpen, openAd])

    return { triggerAd, hasTriggered: hasTriggered.current }
}
