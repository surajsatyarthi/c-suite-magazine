'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getArticleUrl } from '@/lib/urls'

export default function Search() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setResults([])
                return
            }

            setIsLoading(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                setResults(data.results || [])
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.length >= 2) {
            // Optional: Redirect to a full search page if you implement one
            // router.push(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div ref={searchRef} className="relative flex items-center">
            {/* Search Icon / Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-white hover:text-[#f4d875] active:text-[#ffffff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2 focus:ring-offset-[#082945] rounded-sm"
                aria-label="Search"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </button>

            {/* Expandable Input */}
            <div
                className={`
          absolute right-0 top-full mt-2 bg-white shadow-xl rounded-md overflow-hidden transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'w-72 opacity-100 translate-y-0' : 'w-0 opacity-0 -translate-y-2 pointer-events-none'}
        `}
            >
                <form onSubmit={handleSearchSubmit} className="p-2 border-b border-gray-100">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full px-3 py-2 text-sm text-gray-800 bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:bg-white transition-colors"
                    />
                </form>

                {/* Results Dropdown */}
                {(query.length >= 2 || isLoading) && (
                    <div className="max-h-80 overflow-y-auto bg-white">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400 text-xs">Searching...</div>
                        ) : results.length > 0 ? (
                            <ul>
                                {results
                                    .filter((result: any) => {
                                        const slug = result.slug?.current || result.slug;
                                        return slug && typeof slug === 'string' && slug.length > 0;
                                    })
                                    .map((result: any) => {
                                        return (
                                            <li key={result._id} className="border-b border-gray-50 last:border-0">
                                                <Link
                                                    href={getArticleUrl(result)}
                                                    className="block px-4 py-3 hover:bg-gray-50 transition-colors group"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div className="text-xs text-[#c8ab3d] font-medium mb-1 uppercase tracking-wider">
                                                        {result.categories?.[0]?.title || 'Article'}
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-800 group-hover:text-[#082945] leading-snug line-clamp-2">
                                                        {result.title}
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-gray-400 text-xs">
                                No results found for "{query}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
