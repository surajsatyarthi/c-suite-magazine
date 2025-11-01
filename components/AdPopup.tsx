'use client'

import { useState, useEffect, useRef } from 'react'
import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type PopupAd = {
  imageUrl: string
  targetUrl: string
  alt?: string
}

export default function AdPopup() {
  const pathname = usePathname()
  // Only allow popup on full article pages
  if (!pathname || !pathname.startsWith('/article/')) {
    return null
  }
  const [showPopup, setShowPopup] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const hasShownRef = useRef(false)
  const fetchingRef = useRef(false)
  const [ad, setAd] = useState<PopupAd | null>(null)

  useEffect(() => {
    // Frequency capping helpers
    const canShowNow = () => {
      try {
        const now = Date.now()
        const lastShown = Number(localStorage.getItem('adPopup:lastShown') || '0')
        if (lastShown && now - lastShown < 60_000) return false // 60s cooldown
        const historyRaw = localStorage.getItem('adPopup:history')
        const history: number[] = historyRaw ? JSON.parse(historyRaw) : []
        const recent = history.filter((t) => now - t < 900_000) // 15 minutes
        if (recent.length >= 3) return false
        return true
      } catch {
        return true
      }
    }

    const recordShow = () => {
      try {
        const now = Date.now()
        localStorage.setItem('adPopup:lastShown', String(now))
        const historyRaw = localStorage.getItem('adPopup:history')
        const history: number[] = historyRaw ? JSON.parse(historyRaw) : []
        history.push(now)
        localStorage.setItem('adPopup:history', JSON.stringify(history.slice(-20)))
      } catch {}
    }

    // Placement rotation
    const placements = ['homepage-banner', 'article-sidebar-large', 'footer-banner']
    const getNextPlacement = () => {
      try {
        const raw = localStorage.getItem('adPopup:rotationIndex')
        let idx = raw ? Number(raw) : 0
        const placement = placements[idx % placements.length]
        localStorage.setItem('adPopup:rotationIndex', String((idx + 1) % placements.length))
        return placement
      } catch {
        return placements[0]
      }
    }

    // Creative sequencing: brand interstitial for first visit
    const isFirstVisit = (() => {
      try {
        const raw = localStorage.getItem('adPopup:visitCount')
        const count = raw ? Number(raw) : 0
        localStorage.setItem('adPopup:visitCount', String(count + 1))
        return count === 0
      } catch {
        return false
      }
    })()

    const detachAll = () => {
      try { window.removeEventListener('scroll', handleScroll) } catch {}
      try { window.removeEventListener('mousemove', onMouseMove) } catch {}
      try { window.clearTimeout(readyTimer) } catch {}
    }

    const show = async () => {
      if (hasShownRef.current) return
      if (!canShowNow()) return
      // Do not show on very first visit to avoid aggressive interstitials
      if (isFirstVisit) return
      if (!fetchingRef.current) {
        fetchingRef.current = true
        try {
          const placement = getNextPlacement()
          const res = await fetch(`/api/ads?placement=${encodeURIComponent(placement)}`)
          const data = await res.json()
          if (data?.imageUrl && data?.targetUrl) {
            // Preload the image before showing the popup
            const img = new window.Image()
            img.onload = () => {
              // Only show popup after image is fully loaded
              setAd({ imageUrl: data.imageUrl, targetUrl: data.targetUrl, alt: data.alt })
              setShowPopup(true)
              setHasShown(true)
              hasShownRef.current = true
              recordShow()
              detachAll()
            }
            img.onerror = () => {
              // If image fails to load, don't show popup
              console.warn('Ad image failed to load:', data.imageUrl)
              detachAll()
            }
            img.src = data.imageUrl
            return // Don't continue with showing popup until image loads
          }
        } catch (error) {
          console.warn('Failed to fetch ad:', error)
        }
      }
      // Only reach here if no ad data or already fetching - don't show popup
      detachAll()
    }

    const pageStart = Date.now()
    let ready = false
    const readyTimer = window.setTimeout(() => { ready = true }, 15000) // 15s guard before any trigger

    const handleScroll = async () => {
      if (hasShownRef.current) return
      if (!ready) return
      const articleEl = document.querySelector('.prose.prose-lg') as HTMLElement | null
      const windowHeight = window.innerHeight
      const viewportBottom = window.scrollY + windowHeight
      if (articleEl) {
        const rect = articleEl.getBoundingClientRect()
        const articleTopAbs = rect.top + window.scrollY
        const articleHeight = rect.height
        const thresholdY = articleTopAbs + articleHeight * 0.6 // 60%
        const minScroll = Math.max(400, Math.floor(windowHeight * 0.5))
        if (window.scrollY >= minScroll && viewportBottom >= thresholdY) {
          show()
        }
      } else {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrolledPct = docHeight > 0 ? (window.scrollY / docHeight) : 0
        const minScroll = Math.max(400, Math.floor(windowHeight * 0.5))
        if (window.scrollY >= minScroll && scrolledPct >= 0.7) {
          show()
        }
      }
    }

    // Exit intent (desktop): detect upward motion near top chrome
    let lastY = 100
    const onMouseMove = (e: MouseEvent) => {
      if (hasShownRef.current) return
      if (!ready) return
      const goingUp = e.clientY < lastY
      lastY = e.clientY
      if (goingUp && e.clientY <= 10) {
        show()
      }
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      try { window.removeEventListener('scroll', handleScroll) } catch {}
      try { window.removeEventListener('mousemove', onMouseMove) } catch {}
      try { window.clearTimeout(readyTimer) } catch {}
    }
  }, [hasShown])

  if (!showPopup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors z-10"
          aria-label="Close ad"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-8">
          {/* Removed explicit 'Advertisement' label per request */}
          {ad ? (
            <Link href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
              <div className="relative w-full" style={{ aspectRatio: '970/250' }}>
                <OptimizedImage
                  src={ad.imageUrl}
                  alt={ad.alt || 'Sponsored'}
                  fill
                  className="rounded object-contain"
                  sizes="(max-width: 1024px) 100vw, 970px"
                  priority
                />
              </div>
            </Link>
          ) : (
            <div className="bg-gradient-to-br from-[#082945] to-[#0a3350] text-white p-12 rounded-lg text-center">
              <h2 className="text-4xl font-serif font-bold mb-4">Your Brand Here</h2>
              <p className="text-xl mb-6">Full-screen interstitial ad space</p>
              <div className="flex items-center justify-center gap-4 text-gray-300">
                <span>970 x 550 recommended</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
