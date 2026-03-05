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
 * Triggers the full-screen popup ad for Company Sponsored Articles (CSA).
 * Fires at 50% scroll depth. Bypasses the 2-hour cooldown since CSA sponsors paid for popup placement.
 * Only fires once per page load.
 */
export default function CSAPopupTrigger({ imageUrl, targetUrl, alt }: CSAPopupTriggerProps) {
  const { openAd, isOpen } = useAdStore()
  const hasTriggered = useRef(false)

  const isLocaleReady = () => {
    try { return localeReady() } catch { return true }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const handleScroll = () => {
        if (hasTriggered.current || isOpen) return

        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight
        const winHeight = window.innerHeight
        if (docHeight <= winHeight) return

        const scrollPercent = scrollTop / (docHeight - winHeight)

        if (scrollPercent > 0.5 && isLocaleReady()) {
          hasTriggered.current = true
          // skipCooldown=true: CSA sponsors paid for guaranteed popup display
          openAd(
            { image: imageUrl, href: targetUrl, title: alt || 'Sponsored' },
            true // skipCooldown
          )
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Check immediately in case already scrolled
      return () => window.removeEventListener('scroll', handleScroll)
    }, 1000)

    return () => clearTimeout(timer)
  }, [imageUrl, targetUrl, alt, openAd, isOpen])

  return null
}
