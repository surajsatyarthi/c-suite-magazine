"use client"

import { useEffect } from 'react'

type Props = { slug?: string }

export default function IncrementViews({ slug }: Props) {
  useEffect(() => {
    const s = String(slug || '').trim()
    if (!s) return

    // Filter out localhost/development traffic
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.includes('localhost'))
    if (isLocalhost) return

    // Basic bot/user-agent guard
    const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '') || ''
    const isBot = /bot|crawler|spider|prerender|fetch|preview/i.test(ua)
    if (isBot) return

    // Throttle per-session
    const key = `viewed:${s}`
    try {
      const already = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null
      if (already) return
    } catch (_) {}

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 3500)

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: s }),
      signal: controller.signal,
    })
      .then(() => {
        try { sessionStorage.setItem(key, '1') } catch (_) {}
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer))

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [slug])

  return null
}

