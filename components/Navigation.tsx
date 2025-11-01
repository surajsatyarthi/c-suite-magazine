'use client'

import Link from 'next/link'
import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Navigation() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const isArticle = pathname?.startsWith('/article/')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  // Handle keyboard navigation for search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      searchInputRef.current?.blur()
    }
  }

  // Sticky header removed globally per request; no scroll listeners.

  const allCategories = [
    'Leadership', 'Business', 'Manufacturing', 'Public Sector', 'Events',
    'Innovation', 'Not-For-Profit', 'Philanthropy', 'IT & Telco', 'Money & Finance',
    'Engineering', 'Science & Technology', 'Sustainability',
    'Professional Services', 'Startups', 'Retail', 'Energy',
    'Changemakers', 'CEO Woman', 'Education', 'Automotive & Logistics',
    'Healthcare', 'Entrepreneurs', 'Property & Real Estate', 'BFSI', 'Construction & Mining'
  ]

  const categories = [
    'Leadership', 'Business', 'Innovation', 'Money & Finance', 'Startups',
    'Entrepreneurs', 'Technology', 'Healthcare', 'Sustainability',
    'CEO Woman', 'Changemakers'
  ]

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/articles', label: 'Articles' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
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
            
            {/* Logo with Metallic Sheen */}
            <Link 
              href="/" 
              prefetch
              className="flex flex-col items-center text-center mx-auto md:mx-0 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945] rounded-sm"
              aria-label="C-Suite Magazine - Home"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-white mb-0.5">
                C-Suite <span className="metallic-sheen">Magazine</span>
              </h1>
              <p className="text-xs text-white font-serif uppercase tracking-wide">
                Your legacy goes <span className="metallic-sheen">global</span>
              </p>
            </Link>
          </div>
        </div>
      

      {/* Search Bar - Below Logo (no glow overlay) */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form 
            onSubmit={handleSearch} 
            className="flex items-center justify-center gap-2 max-w-2xl mx-auto"
            role="search"
            aria-label="Search articles"
          >
            <div className="relative flex-1">
              <label htmlFor="search-input" className="sr-only">
                Search articles
              </label>
              <input
                id="search-input"
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search articles..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:border-transparent"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Enter keywords to search for articles. Press Escape to clear.
              </div>
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 bg-[#082945] text-white rounded-lg hover:bg-[#0a3a5c] focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 transition-colors font-medium text-sm"
              aria-label="Submit search"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Horizontal Category Menu with Auto-Scroll (no glow overlay) */}
      <div className="border-b border-white/10 bg-[#0b2f4c]/40 overflow-hidden">
        <div className="category-scroll-wrapper">
          <nav 
            className="category-scroll-container"
            role="navigation"
            aria-label="Article categories"
          >
            <div className="category-scroll-content">
              {allCategories.map((category) => (
                <Link
                  key={category}
                  href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  prefetch
                  className="text-sm font-medium text-gray-100 hover:text-[#c8ab3d] focus:text-[#c8ab3d] focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#0b2f4c] whitespace-nowrap transition-colors premium-underline rounded-sm px-1"
                  aria-label={`View ${category} articles`}
                >
                  {category}
                </Link>
              ))}
            </div>
            {/* Duplicate for seamless loop */}
            <div className="category-scroll-content" aria-hidden="true">
              {allCategories.map((category) => (
                <Link
                  key={`${category}-duplicate`}
                  href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="text-sm font-medium text-gray-100 hover:text-[#c8ab3d] whitespace-nowrap transition-colors premium-underline"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {category}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
      </nav>
    </>
  )
}
