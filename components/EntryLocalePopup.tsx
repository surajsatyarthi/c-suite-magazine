'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { ISO_COUNTRY_CODES } from '@/lib/countries'
import { getCountryFlag } from '@/components/CountrySelector'
import { setLocaleOpen, setLocaleDismissed, setHasCountry } from '@/lib/localeGate'

// Language selection removed per request

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}`
}

export default function EntryLocalePopup() {
  // Show locale popup on all pages (global gatekeeper)
  // if (pathname && pathname !== '/') { return null }
  const [isOpen, setIsOpen] = useState(false)
  const [country, setCountry] = useState<string>('US')
  const dialogRef = useRef<HTMLDivElement>(null)

  const COUNTRIES = useMemo(() => {
    const display = new Intl.DisplayNames(['en'], { type: 'region' })
    return ISO_COUNTRY_CODES.map(code => ({
      code,
      name: (display.of(code) || code) as string,
      flag: getCountryFlag(code),
    }))
  }, [])

  useEffect(() => {
    try {
      const previouslySelected = localStorage.getItem('localeSelected') === 'true'
      const cookieCountry = getCookie('user-country')
      const dnd = getCookie('locale-dnd')
      const sessionShown = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('localeShown') === '1'
      const dismissed = typeof localStorage !== 'undefined' && localStorage.getItem('localePopupDismissed') === '1'

      if (cookieCountry) setCountry(cookieCountry)

      if (previouslySelected && cookieCountry) {
        try { setHasCountry(true) } catch { }
        try { setLocaleOpen(false) } catch { }
        setIsOpen(false)
        return
      }

      if (sessionShown || dnd === '1' || dismissed) {
        try { setLocaleOpen(false) } catch { }
        setIsOpen(false)
        return
      }

      setIsOpen(true)
      try { setLocaleOpen(true) } catch { }
    } catch {
      setIsOpen(true)
      try { setLocaleOpen(true) } catch { }
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  // When opened, move focus to the first interactive element inside the dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
      'select, button, [href], input, textarea, [tabindex]:not([tabindex="-1"])'
    )
    firstFocusable?.focus()
  }, [isOpen])

  // Allow other components (e.g., header icons) to open this popup on demand
  useEffect(() => {
    const openHandler = () => setIsOpen(true)
    document.addEventListener('csuite:open-locale-popup', openHandler as EventListener)
    return () => document.removeEventListener('csuite:open-locale-popup', openHandler as EventListener)
  }, [])

  // Lock background scroll while modal is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isOpen) {
      try {
        const prev = document.body.style.overflow
        document.body.setAttribute('data-prev-overflow', prev)
        document.body.style.overflow = 'hidden'
      } catch { }
    } else {
      try {
        const prev = document.body.getAttribute('data-prev-overflow') || ''
        document.body.style.overflow = prev
        document.body.removeAttribute('data-prev-overflow')
        // Reflect close to LocaleGate without implying dismissal
        try { setLocaleOpen(false) } catch { }
      } catch { }
    }

    return () => {
      try {
        const prev = document.body.getAttribute('data-prev-overflow') || ''
        document.body.style.overflow = prev
        document.body.removeAttribute('data-prev-overflow')
      } catch { }
    }
  }, [isOpen])

  const handleSave = async () => {
    try {
      setCookie('user-country', country)
      localStorage.setItem('localeSelected', 'true')
      // Signal dismissal so other components can proceed
      try {
        setHasCountry(true)
        setLocaleDismissed()
      } catch { }
      try { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('localeShown', '1') } catch { }

      // Try to sync country with existing API used by Navigation
      try {
        await fetch('/api/country', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country }),
        })
      } catch { }

      // Dispatch event to notify Navigation component about country change
      try {
        const event = new CustomEvent('csuite:country-updated', {
          detail: { country }
        })
        document.dispatchEvent(event)
      } catch { }

      setIsOpen(false)
    } catch (err) {
      // Even if something fails, close to avoid blocking
      handleClose()
    }
  }

  const handleClose = () => {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('localeShown', '1')
      setCookie('locale-dnd', '1', 1)
      try { setLocaleDismissed() } catch { }
    } catch { }

    try {
      const evt = new Event('csuite:close-locale-popup')
      document.dispatchEvent(evt)
    } catch { }

    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="locale-title"
      aria-describedby="locale-desc"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="entry-locale-popup focus-trap relative z-10 w-[92%] max-w-lg bg-black/40 text-white rounded-2xl border border-white/15 p-6 md:p-8 shadow-2xl"
      >
        <h2 id="locale-title" className="text-2xl md:text-3xl font-serif font-black mb-4 text-white">Welcome to C-Suite Magazine</h2>
        <p id="locale-desc" className="mb-6 text-white">Select your country.</p>
        <div className="grid grid-cols-1 gap-6">
          {/* Country */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Country</label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full appearance-none bg-black/30 border border-white/20 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] text-white"
                aria-label="Select country"
                autoFocus
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white">▾</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setIsOpen(false)
              try { setLocaleDismissed() } catch { }
            }}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Not now
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#c8ab3d] text-[#082945] font-semibold rounded-lg hover:bg-[#b39a35] focus:outline-none focus:ring-2 focus:ring-[#c8ab3d]/50"
          >
            Continue
          </button>
        </div>

        <p className="footer-note mt-4 text-white">You can change this anytime from the header.</p>
      </div>
    </div>
  )
}
