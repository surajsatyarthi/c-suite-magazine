'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const allCategories = [
    'Leadership', 'Business', 'Manufacturing', 'Public Sector', 'Events',
    'Innovation', 'Not-For-Profit', 'Philanthropy', 'IT & Telco', 'Money & Finance',
    'Consumer & Entertainment', 'Engineering', 'Science & Technology', 'Sustainability',
    'Professional Services', 'Mind, Body, Soul', 'Startups', 'Retail', 'Energy',
    'Changemakers', 'CEO Woman', 'Lifestyle', 'Education', 'Automotive & Logistics',
    'Healthcare', 'Entrepreneurs', 'Property & Real Estate', 'BFSI', 'Construction & Mining'
  ]

  const categories = [
    'Leadership', 'Business', 'Innovation', 'Money & Finance', 'Startups',
    'Entrepreneurs', 'Technology', 'Healthcare', 'Sustainability', 'Lifestyle',
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
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl md:text-3xl font-serif font-black text-gray-900">
              C-Suite Magazine
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#082945] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-[#082945] transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Category Menu with Auto-Scroll */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="category-scroll-wrapper">
          <div className="category-scroll-container">
            <div className="category-scroll-content">
              {allCategories.map((category) => (
                <Link
                  key={category}
                  href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  className="text-sm font-medium text-gray-700 hover:text-[#c8ab3d] whitespace-nowrap transition-colors"
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
                  className="text-sm font-medium text-gray-700 hover:text-[#c8ab3d] whitespace-nowrap transition-colors"
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
