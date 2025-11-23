'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// Load the locale popup only when rendered (i.e., on homepage)
const EntryLocalePopup = dynamic(() => import('@/components/EntryLocalePopup'), {
  loading: () => null,
})

export default function LazyEntryLocale() {
  // Load on all pages to ensure country selection is captured before ads
  return <EntryLocalePopup />
}

