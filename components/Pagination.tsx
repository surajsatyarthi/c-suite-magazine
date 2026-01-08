'use client'

import { useEffect, useState } from 'react'

interface PaginationProps {
    totalItems: number
    itemsPerPage: number
    currentPage: number
    onPageChange: (page: number) => void
}

export default function Pagination({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // Don't render if there's only one page or no items
    if (totalPages <= 1) return null

    const pages: (number | string)[] = []

    // Always show first page
    pages.push(1)

    if (currentPage > 3) {
        pages.push('...')
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
    }

    if (currentPage < totalPages - 2) {
        pages.push('...')
    }

    // Always show last page if there's more than one
    if (totalPages > 1) {
        pages.push(totalPages)
    }

    // Update URL hash when page changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.location.hash = `page=${currentPage}`
        }
    }, [currentPage])

    const handlePageClick = (page: number) => {
        onPageChange(page)
        // Scroll to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Pagination">
            {/* Previous button */}
            <button
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                aria-label="Previous page"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Page numbers */}
            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                            ...
                        </span>
                    )
                }

                const pageNumber = page as number
                const isActive = pageNumber === currentPage

                return (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageClick(pageNumber)}
                        className={`
              min-w-[40px] px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2
              ${isActive
                                ? 'bg-[#082945] text-white border-[#082945] font-semibold'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }
            `}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {pageNumber}
                    </button>
                )
            })}

            {/* Next button */}
            <button
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2"
                aria-label="Next page"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </nav>
    )
}
