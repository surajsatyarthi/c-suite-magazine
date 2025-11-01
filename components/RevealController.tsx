"use client"

import { useEffect } from "react"

export default function RevealController() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"))
    if (elements.length === 0) return

    const onIntersect: IntersectionObserverCallback = (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          el.classList.add("is-visible")
          observer.unobserve(el)
        }
      }
    }

    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.1,
    })

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}

