'use client'

import { useEffect, useState } from 'react'

export default function ArticleProgress() {
  const [progress, setProgress] = useState(0)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReducedMotion = () => setIsReducedMotion(mediaQuery.matches)
    updateReducedMotion()
    mediaQuery.addEventListener('change', updateReducedMotion)

    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
          setProgress(pct)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      mediaQuery.removeEventListener('change', updateReducedMotion)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] z-50 pointer-events-none">
      <div
        className={`h-full bg-gradient-to-r from-[#c8ab3d] via-[#e7d07a] to-[#c8ab3d] ${
          isReducedMotion ? '' : 'transition-[width] duration-200 ease-out'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

