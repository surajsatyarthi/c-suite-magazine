'use client'

import React from 'react'

type Props = {
  className?: string
}

export default function SkeletonCard({ className = '' }: Props) {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-sm h-full animate-pulse ${className}`} aria-busy="true" aria-label="Loading">
      <div className="relative h-56 bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

