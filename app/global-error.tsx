'use client'

import { useEffect } from 'react'
import Link from 'next/link'

// Error boundary must be Client Component
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[GlobalError] Uncaught exception:', error)
  }, [error])

  return (
    <html>
      <body className="bg-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-[#082945]">Something went wrong!</h2>
            <p className="text-gray-600">
              Our engineering team has been notified. Please try refreshing the page.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#082945] hover:bg-[#0a3350] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c8ab3d]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c8ab3d]"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
