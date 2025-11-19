'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// Load the locale popup only when rendered (i.e., on homepage)
const EntryLocalePopup = dynamic(() => import('@/components/EntryLocalePopup'), {
  loading: () => null,
})

export default function LazyEntryLocale() {
  const pathname = usePathname()
  // Guard rendering to homepage to avoid loading on other routes
  if (pathname && pathname !== '/') return null
  return <EntryLocalePopup />
}

