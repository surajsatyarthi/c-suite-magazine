'use client'

import { useState, useEffect } from 'react'

export default function AdPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (hasShown) return
      
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100
      
      if (scrollPercentage >= 50) {
        setShowPopup(true)
        setHasShown(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasShown])

  if (!showPopup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <button
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors z-10"
          aria-label="Close ad"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-8">
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">Advertisement</p>
          </div>
          <div className="bg-gradient-to-br from-[#082945] to-[#0a3350] text-white p-12 rounded-lg text-center">
            <h2 className="text-4xl font-serif font-bold mb-4">Your Brand Here</h2>
            <p className="text-xl mb-6">Full-screen interstitial ad space</p>
            <div className="flex items-center justify-center gap-4 text-gray-300">
              <span>970 x 550 recommended</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
