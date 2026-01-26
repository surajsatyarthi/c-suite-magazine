'use client'

/**
 * Embedded Sanity Studio
 * This route serves the Sanity Studio directly in the Next.js app
 * Benefits:
 * - Instant config updates (no external studio rebuild needed)
 * - Same-origin for better preview integration
 * - Full control over studio behavior
 */

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
