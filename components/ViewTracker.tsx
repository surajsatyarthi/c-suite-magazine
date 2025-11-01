'use client'

import { useEffect } from 'react'

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return

    const payload = JSON.stringify({ slug })

    try {
      // Prefer sendBeacon for reliability without blocking
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/views', blob)
        return
      }
    } catch {}

    // Fallback to fetch
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    }).catch(() => {})
  }, [slug])

  return null
}

