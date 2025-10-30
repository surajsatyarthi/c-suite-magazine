'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

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
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center p-2 rounded-md text-gray-700 hover:text-[#c8ab3d] hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center text-center mx-auto md:mx-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-gray-900 mb-0.5">
              C-Suite Magazine
            </h1>
            <p className="text-xs text-gray-500 font-serif">
              Your legacy goes global
            </p>
          </Link>
          
          {/* Desktop nav links - hidden on mobile */}
          <div className="hidden md:flex space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#c8ab3d] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu - shown when menu is open */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-[#c8ab3d] transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar - Below Logo */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <form onSubmit={handleSearch} className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
              className="px-4 sm:px-6 py-2 bg-[#082945] text-white rounded-lg hover:bg-[#0a3a5c] transition-colors font-medium text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Horizontal Category Menu with Auto-Scroll */}
      <div className="border-b border-gray-200 bg-gray-50 overflow-hidden">
        <div className="category-scroll-wrapper">
          <div className="category-scroll-container">
            <div className="category-scroll-content">
              {allCategories.map((category) => (
                <Link
                  key={category}
                  href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="text-sm font-medium text-gray-700 hover:text-[#c8ab3d] whitespace-nowrap transition-colors px-2"
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
                  className="text-sm font-medium text-gray-700 hover:text-[#c8ab3d] whitespace-nowrap transition-colors px-2"
                  tabIndex={-1}
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
