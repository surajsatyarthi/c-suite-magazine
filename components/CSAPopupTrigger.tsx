'use client'

import { useEffect, useRef } from 'react'
import { useAdStore } from '@/store/adStore'
import { localeReady } from '@/lib/localeGate'

interface CSAPopupTriggerProps {
  imageUrl: string
  targetUrl: string
  alt?: string
}

/**
 * CSAPopupTrigger
 * Triggers the sponsor-specific popup ad for CSA articles.
 * Fires when the inline ad image (triggersPopup=true) enters the viewport —
 * NOT at a fixed scroll percentage. This keeps CSA popup behaviour separate
 * from the site-wide generic scroll popup.
 * Bypasses the 2-hour cooldown since CSA sponsors paid for guaranteed placement.
 * Only fires once per page load.
 */
export default function CSAPopupTrigger({ imageUrl, targetUrl, alt }: CSAPopupTriggerProps) {
  const { openAd, isOpen } = useAdStore()
  const hasTriggered = useRef(false)

  const isLocaleReady = () => {
    try { return localeReady() } catch { return true }
  }

  useEffect(() => {
    const handleTrigger = () => {
      if (hasTriggered.current || isOpen || !isLocaleReady()) return
      hasTriggered.current = true
      openAd(
        { image: imageUrl, href: targetUrl, title: alt || '' },
        true // skipCooldown: CSA sponsors paid for guaranteed popup display
      )
    }

    window.addEventListener('csa-popup-trigger', handleTrigger)
    return () => window.removeEventListener('csa-popup-trigger', handleTrigger)
  }, [imageUrl, targetUrl, alt, openAd, isOpen])

  return null
}
