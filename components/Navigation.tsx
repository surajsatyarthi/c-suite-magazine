'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import React from 'react'
import { getCountryFlag } from './CountrySelector'
import Search from '@/components/Search'
// Fetch categories via server API to avoid client-side Sanity failures

export default function Navigation() {
  const pathname = usePathname()
  const [countryCode, setCountryCode] = useState<string>('US')
  const [isLoading, setIsLoading] = useState(true)

  // Fetch country from server-side detection API
  useEffect(() => {
    async function fetchCountry() {
      try {
        const response = await fetch('/api/country')
        const data = await response.json()
        setCountryCode(data.country || 'US')
      } catch (error) {
        console.error('Failed to fetch country:', error)
        // Fallback to browser locale detection
        try {
          const locale = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US'
          const parts = locale.split('-')
          const cc = parts.length > 1 ? parts[1].toUpperCase() : 'US'
          setCountryCode(cc)
        } catch {
          setCountryCode('US')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountry()
  }, [])

  // Handle manual country selection
  const handleCountryChange = async (newCountryCode: string) => {
    try {
      const response = await fetch('/api/country', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country: newCountryCode }),
      })

      if (response.ok) {
        setCountryCode(newCountryCode)
      } else {
        console.error('Failed to update country preference')
      }
    } catch (error) {
      console.error('Error updating country:', error)
    }
  }

  // Listen for country changes from EntryLocalePopup
  useEffect(() => {
    const handleCountryUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.country) {
        setCountryCode(customEvent.detail.country)
      }
    }

    document.addEventListener('csuite:country-updated', handleCountryUpdate)
    return () => document.removeEventListener('csuite:country-updated', handleCountryUpdate)
  }, [])

  const [allCategories, setAllCategories] = useState<Array<{ title: string, slug: string }>>([])
  const REMOVED_CATEGORIES = new Set<string>(['Business', 'Events', 'Retail', 'Cover Story'])
  const scrollContainerRef = React.useRef<HTMLElement>(null)

  // Fetch categories with articles (server-side via API)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        const data = await res.json()
        const cats = Array.isArray(data?.categories) ? data.categories : []
        if (cats.length) {
          setAllCategories(
            cats
              .filter((c: any) => !REMOVED_CATEGORIES.has(String(c?.title || '')))
          )
          return
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
      setAllCategories([])
    }
    fetchCategories()
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || allCategories.length === 0) return

    let scrollDirection = 1
    let scrollInterval: NodeJS.Timeout

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (!container) return

        const maxScroll = container.scrollWidth - container.clientWidth
        const currentScroll = container.scrollLeft

        if (currentScroll >= maxScroll) {
          scrollDirection = -1
        } else if (currentScroll <= 0) {
          scrollDirection = 1
        }

        container.scrollLeft += scrollDirection * 0.5
      }, 50)
    }

    const stopScrolling = () => {
      clearInterval(scrollInterval)
    }

    // Start scrolling after 2 seconds
    const startDelay = setTimeout(startScrolling, 2000)

    // Stop scrolling on user interaction
    container.addEventListener('mouseenter', stopScrolling)
    container.addEventListener('touchstart', stopScrolling)

    // Resume scrolling when user leaves
    container.addEventListener('mouseleave', startScrolling)
    container.addEventListener('touchend', startScrolling)

    return () => {
      clearTimeout(startDelay)
      clearInterval(scrollInterval)
      container.removeEventListener('mouseenter', stopScrolling)
      container.removeEventListener('touchstart', stopScrolling)
      container.removeEventListener('mouseleave', startScrolling)
      container.removeEventListener('touchend', startScrolling)
    }
  }, [allCategories.length])

  const categories = [
    'Leadership', 'Business', 'Innovation', 'Money & Finance', 'Startups',
    'Entrepreneurs', 'Technology', 'Healthcare', 'Sustainability',
    'CEO Woman', 'Changemakers'
  ]

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact Us' },
  ]

  return (
    <>
      {/* Skip link removed per request to hide from top */}

      {/* Main Navigation */}
      <nav
        className="dark-section relative overflow-hidden bg-[#082945] text-white border-b-[3px] border-[#c8ab3d]"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Removed header background glow for a cleaner, non-shiny header */}
          <div className="flex justify-center items-center py-3 relative z-10">

            {/* Site Logo (Bodoni FLF + Playfair Display) */}
            <Link
              href="/"
              prefetch
              className="block w-full mx-auto md:mx-0 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945] rounded-sm"
              aria-label="C-Suite Magazine - Home"
            >
              <div className="site-logo text-white">
                <div className="site-logo-inner">
                  <div className="site-logo-title">C<span className="site-logo-dash">-</span>SUITE</div>
                  <div className="site-logo-subtitle metallic-sheen metallic-sheen-strong">MAGAZINE</div>
                </div>
              </div>
            </Link>

            {/* Country trigger (top-right) */}
            <div className="absolute right-4 top-3 flex items-center gap-3">
              {/* Render Search unconditionally to ensure SSR visibility */}
              <Search />
              {/* Flag button opens locale popup */}
              {!isLoading && (
                <button
                  onClick={() => document.dispatchEvent(new Event('csuite:open-locale-popup'))}
                  className="px-3 py-2 min-w-[44px] min-h-[44px] text-white hover:text-[#c8ab3d] transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945]"
                  title="Change country"
                  aria-label="Change country"
                  aria-haspopup="dialog"
                >
                  <span className="text-2xl leading-none" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.6)' }}>
                    {getCountryFlag(countryCode)}
                  </span>
                </button>
              )}
            </div>
          </div>
          {/* Header tagline */}
          <div className="text-center pb-3">
            <p className="uppercase tracking-wide font-semibold text-[#c8ab3d] text-sm">
              YOUR LEGACY GOES GLOBAL
            </p>
          </div>
        </div>




        {/* Horizontal Category Menu - Clean Minimal Design */}
        <div className="border-b border-gray-200 bg-white">
          <div className="category-scroll-wrapper-minimal">
            <nav
              ref={scrollContainerRef}
              className="category-scroll-container-minimal"
              role="navigation"
              aria-label="Article categories"
            >
              <div className="category-scroll-content-minimal">
                {allCategories.filter((c: any) => typeof c?.slug === 'string' && c.slug.length > 0).map((category) => {
                  const categoryPath = `/category/${encodeURIComponent(category.slug)}`
                  const isActive = pathname === categoryPath
                  return (
                    <Link
                      key={category.slug}
                      href={categoryPath}
                      prefetch
                      className={`text-sm font-medium whitespace-nowrap transition-colors px-4 py-3 ${isActive
                        ? 'text-[#c8ab3d] border-b-2 border-[#c8ab3d]'
                        : 'text-[#082945] hover:text-[#c8ab3d]'
                        }`}
                      aria-label={`View ${category.title} articles`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {category.title}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </div>
      </nav>
    </>
  )
}
