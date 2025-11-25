'use client'
/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { NextStudio } from 'next-sanity/studio'
import { useEffect, useState } from 'react'
import config from '../../../sanity.config'

export const dynamic = 'force-dynamic'

// metadata and viewport exports are only supported in Server Components; omitted here

export default function StudioPage() {
  const [fallback, setFallback] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setFallback(true), 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="dark-section">
      {fallback && (
        <div style={{padding: '16px', textAlign: 'center'}}>
          <a href="https://studio.csuitemagazine.global" rel="noreferrer" target="_blank">Open first‑party Studio</a>
        </div>
      )}
      <NextStudio config={config} />
    </div>
  )
}
