'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { usePathname, useSearchParams } from 'next/navigation'
import { onLocaleGateChange, localeReady as localeGateReady, isPopupPresentInDOM } from '@/lib/localeGate'

type PopupAd = {
  imageUrl: string
  targetUrl: string
  alt?: string
}

export default function AdInterstitial() {
  const AD_LINK = 'https://www.patek.com/en/collection/aquanaut/5968r-001'
  const GULFSTREAM_LINK = 'https://www.gulfstream.com/en/aircraft/gulfstream-g700/'
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const forceOpen = searchParams?.get('openAd') === '1'
  const [localeReady, setLocaleReady] = useState<boolean>(() => {
    try { return localeGateReady() } catch { return false }
  })
  const [hasInteracted, setHasInteracted] = useState<boolean>(false)
  // Treat category article pages as eligible for interstitials (remove legacy /article route)
  const isCategoryArticle = !!pathname && /^\/category\/[^/]+\/[^/]+$/.test(pathname)
  const categoryFromPath = (() => {
    try {
      const parts = String(pathname || '').split('/')
      return parts[2] || ''
    } catch { return '' }
  })()
  const isCompanySponsored = /^(company-sponsored)$/i.test(categoryFromPath)
  const enabled = !!(forceOpen || isCategoryArticle)
  const cooldownMs = (() => {
    try {
      const raw = String(process.env.NEXT_PUBLIC_AD_COOLDOWN_MS || '').trim()
      return raw === '' ? 1000 : (parseInt(raw, 10) || 1000)
    } catch {
      return 1000
    }
  })()
  const keywordCap = (() => {
    try {
      return parseInt(String(process.env.NEXT_PUBLIC_AD_KEYWORD_CAP || '').trim(), 10) || 3
    } catch {
      return 3
    }
  })()
  const AD_CONFIG: any = (typeof window !== 'undefined' ? (window as any).__AD_CONFIG__ : null)
  const primaryImage = AD_CONFIG?.popup?.imageUrl || '/popup-ad.png'
  const primaryTarget = AD_CONFIG?.popup?.targetUrl || AD_LINK
  const primaryAlt = AD_CONFIG?.popup?.alt || 'Sponsored'
  const ADS: PopupAd[] = [
    { imageUrl: primaryImage, targetUrl: primaryTarget, alt: primaryAlt },
    { imageUrl: '/popup-ad%202.png', targetUrl: GULFSTREAM_LINK, alt: 'Sponsored' },
  ]
  // Allow legacy/variant filenames with spaces or hyphens
  const SECONDARY_FALLBACKS = [
    '/popup-ad.png',        // clean filename
    '/popup-ad%202.png',    // encoded space
    '/popup-ad 2.png',      // literal space
    '/popup-ad-2.png',      // hyphenated variant
    '/popup-ad-2.jpg',      // jpg variant
    '/pop%20up%20ad%202.png' // older spaced naming
  ]
  // Do not early return before hooks; guard render at the end with `enabled`

  const [show, setShow] = useState(false)
  const [ad, setAd] = useState<PopupAd | null>(null)
  const [adIndex, setAdIndex] = useState<number>(0)
  const [aspectRatio, setAspectRatio] = useState<string>('970/550')
  const shownRef = useRef(false)
  const lastShownAtRef = useRef<number>(0)
  const keywordTriggerCountRef = useRef<number>(0)
  // Cached article element to avoid repeated DOM queries
  const cachedArticleElRef = useRef<HTMLElement | null>(null)


  // Helper to try loading an ad image and update state
  const loadAd = (index: number, onReady?: () => void) => {
    const primary = ADS[index]?.imageUrl
    // Always include broad fallbacks to ensure at least one resolves
    const tryUrls = [primary, ...SECONDARY_FALLBACKS].filter(Boolean) as string[]
    // Fallback SVG if nothing resolves
    const fallbackDataUri =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="970" height="550">
           <rect width="100%" height="100%" fill="#111"/>
           <text x="50%" y="50%" fill="#fff" font-size="36" text-anchor="middle" dominant-baseline="middle">Sponsored</text>
         </svg>`
      )

    const setFromImg = (img: HTMLImageElement, src: string) => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(`${img.naturalWidth}/${img.naturalHeight}`)
      } else {
        setAspectRatio('970/550')
      }
      setAd({ imageUrl: src, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
      setShow(true)
      setAdIndex(index)
      lastShownAtRef.current = Date.now()
      shownRef.current = true
      try { onReady?.() } catch { }
    }

    const src = tryUrls[0]
    if (!src) {
      setAspectRatio('970/550')
      setAd({ imageUrl: fallbackDataUri, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
      setShow(true)
      setAdIndex(index)
      lastShownAtRef.current = Date.now()
      shownRef.current = true
      try { onReady?.() } catch { }
      return
    }

    const img = new window.Image()
    img.onload = () => setFromImg(img, src)
    img.onerror = () => {
      if (tryUrls.length > 1) {
        const alt = tryUrls[1]!
        const img2 = new window.Image()
        img2.onload = () => setFromImg(img2, alt)
        img2.onerror = () => {
          setAspectRatio('970/550')
          setAd({ imageUrl: fallbackDataUri, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
          setShow(true)
          setAdIndex(index)
          lastShownAtRef.current = Date.now()
          shownRef.current = true
          try { onReady?.() } catch { }
        }
        img2.src = alt
      } else {
        setAspectRatio('970/550')
        setAd({ imageUrl: fallbackDataUri, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
        setShow(true)
        setAdIndex(index)
        shownRef.current = true
        try { onReady?.() } catch { }
      }
    }
    img.src = src
  }



  // Reset on route change with cache invalidation
  useEffect(() => {
    if (!forceOpen) {
      shownRef.current = false
      setShow(false)
      setAdIndex(0)
      setAd(null)
      setAspectRatio('970/550')
      cachedArticleElRef.current = null // Invalidate article element cache on route change
    }
  }, [pathname])

  // Track first meaningful user interaction to gate ad reveal
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

  useEffect(() => {
    if (!enabled) return
    // Always gate the FIRST popup ad until locale is dismissed (site-wide)
    const onLocaleDismissed = () => {
      try { setLocaleReady(true) } catch { }
    }
    window.addEventListener('localePopupDismissed', onLocaleDismissed, { once: true })
    const detach = () => {
      try { window.removeEventListener('scroll', onScroll) } catch { }
      try { mo.disconnect() } catch { }
      if (imgListeners.length) {
        for (const { img, handler } of imgListeners) {
          img.removeEventListener('load', handler)
        }
      }
      try { sponsorObserver?.disconnect() } catch { }
    }
    const reveal = (fromKeyword?: boolean) => {
      // Hard gate: do not reveal the FIRST ad until locale popup is dismissed
      if (!localeReady) return
      // Require a user interaction before first reveal (unless force-open)
      if (!hasInteracted && !forceOpen) return
      // Safety net: if popup is present in DOM or marked open, bail
      if (isPopupPresentInDOM()) return
      if (fromKeyword && isCompanySponsored) {
        const now = Date.now()
        if (now - lastShownAtRef.current < cooldownMs) return
        if (keywordTriggerCountRef.current >= keywordCap) return
      } else {
        if (shownRef.current) return
      }
      loadAd(0)
      if (fromKeyword && isCompanySponsored) {
        keywordTriggerCountRef.current = keywordTriggerCountRef.current + 1
      }
    }

    // Homepage disabled: no immediate reveal on home

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
        if (passedHalf()) reveal(false)
      }, 50) // Throttle to 50ms for smooth performance
    }

    // Throttled MutationObserver to reduce CPU usage
    let mutationTimeout: NodeJS.Timeout | null = null
    const throttledMutationCallback = () => {
      if (shownRef.current) return
      if (mutationTimeout) return // Skip if already scheduled

      mutationTimeout = setTimeout(() => {
        mutationTimeout = null
        if (passedHalf()) reveal(false)
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
          if (!shownRef.current && passedHalf()) reveal(false)
        }
        img.addEventListener('load', handler)
        imgListeners.push({ img, handler })
        processedImages.add(img) // Mark as processed
      }
    }

    // Sponsor mention anchor trigger for CSA
    let sponsorObserver: IntersectionObserver | null = null
    const setupSponsorTrigger = () => {
      if (!isCompanySponsored) return
      const el = getArticleEl()
      if (!el) return
      // Keywords come from ENV or sensible defaults
      const raw = String(process.env.NEXT_PUBLIC_SPONSOR_KEYWORDS || '').trim()
      const defaults = ['sponsor', 'sponsored', 'executive partner', 'partner showcase', 'advertiser', 'brabus', 'patek', 'gulfstream', 'isfacebook2002so']
      const fromArticle: string[] | null = Array.isArray(AD_CONFIG?.keywords)
        ? (AD_CONFIG.keywords as any[]).map((x) => String(x || ''))
        : null
      const base: string[] = fromArticle && fromArticle.length ? fromArticle : (raw ? raw.split(',') : defaults)
      const keys = base.map((s: string) => String(s).trim().toLowerCase()).filter(Boolean)
      const paras = Array.from(el.querySelectorAll('p')) as HTMLParagraphElement[]
      const target = paras.find(p => {
        const t = String(p.textContent || '').toLowerCase()
        return keys.some(k => k && t.includes(k))
      })
      if (!target) return
      sponsorObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(true)
          }
        }
      }, { threshold: 0.6 })
      sponsorObserver.observe(target)
    }

    // Kickoff
    window.addEventListener('scroll', onScroll, { passive: true })
    const onCustomTrigger = () => reveal(true)
    window.addEventListener('trigger-ad-interstitial', onCustomTrigger)
    const el = getArticleEl()
    if (el) mo.observe(el, { childList: true, subtree: true })
    attachImageListeners()
    setupSponsorTrigger()

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

    // Reveal via scroll/mutation only when localeReady

    // Force open for QA still respects locale gating site-wide
    if (forceOpen && localeReady && !isPopupPresentInDOM()) {
      reveal(true)
    }

    return () => {
      detach()
      window.removeEventListener('trigger-ad-interstitial', onCustomTrigger)
      if (mutationTimeout) clearTimeout(mutationTimeout)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [pathname, forceOpen, localeReady, enabled, hasInteracted])

  // Subscribe to LocaleGate changes
  useEffect(() => {
    const unsub = onLocaleGateChange((st) => {
      try { setLocaleReady(st.dismissed && !st.open) } catch { }
    })
    return () => { try { unsub() } catch { } }
  }, [])

  if (!enabled || !show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative bg-black/40 text-white rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/50 border border-white/10 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <button
          onClick={() => {
            if (!isCompanySponsored && adIndex === 0) {
              // Non-CSA: switch to second ad instead of closing
              loadAd(1)
              setAdIndex(1)
            } else {
              // CSA: single full popup only; close
              setShow(false)
            }
          }}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors z-10"
          aria-label="Close ad"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-6">
          <Link href={ad?.targetUrl || AD_LINK} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
            <div className="relative w-full rounded-xl overflow-hidden min-h-[220px]" style={{ aspectRatio }}>
              <OptimizedImage
                src={ad?.imageUrl || ADS[0].imageUrl}
                alt={ad?.alt || 'Sponsored'}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 970px"
                priority
                decoding="async"
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
