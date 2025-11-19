// LocaleGate: single source of truth for locale popup gating
// Tracks whether the popup is currently open, whether it has been dismissed,
// and exposes a ready() method for components like AdInterstitial.

type LocaleGateState = {
  open: boolean
  dismissed: boolean
  hasCountry: boolean
}

type Listener = (state: LocaleGateState) => void

const state: LocaleGateState = {
  open: false,
  dismissed: false,
  hasCountry: false,
}

const listeners = new Set<Listener>()

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function notify() {
  for (const l of Array.from(listeners)) {
    try { l({ ...state }) } catch {}
  }
}

// Initialize from persisted values when available
export function initLocaleGate() {
  try { state.dismissed = (localStorage.getItem('localePopupDismissed') === '1') } catch {}
  try { state.hasCountry = !!getCookie('user-country') } catch {}
  try {
    const openAttr = typeof document !== 'undefined' ? document.body.getAttribute('data-locale-open') : null
    state.open = openAttr === '1'
  } catch {}
  notify()
}

export function onLocaleGateChange(listener: Listener) {
  listeners.add(listener)
  // Immediately inform new listener
  try { listener({ ...state }) } catch {}
  return () => listeners.delete(listener)
}

export function setLocaleOpen(open: boolean) {
  state.open = !!open
  if (typeof document !== 'undefined') {
    try {
      if (open) {
        document.body.setAttribute('data-locale-open', '1')
        // Clear stale dismissal when popup opens
        try { localStorage.setItem('localePopupDismissed', '0') } catch {}
        state.dismissed = false
        // Fire an event for backwards compatibility
        try { window.dispatchEvent(new CustomEvent('localePopupOpened')) } catch {}
      } else {
        document.body.removeAttribute('data-locale-open')
      }
    } catch {}
  }
  notify()
}

export function setLocaleDismissed() {
  state.dismissed = true
  state.open = false
  if (typeof document !== 'undefined') {
    try { document.body.removeAttribute('data-locale-open') } catch {}
  }
  try { localStorage.setItem('localePopupDismissed', '1') } catch {}
  // Back-compat event
  try { window.dispatchEvent(new CustomEvent('localePopupDismissed')) } catch {}
  notify()
}

export function setHasCountry(has: boolean) {
  state.hasCountry = !!has
  notify()
}

export function getLocaleGateState(): LocaleGateState {
  return { ...state }
}

// Ready means: popup not open AND user has explicitly dismissed it.
export function localeReady(): boolean {
  return state.dismissed && !state.open
}

// Safety net for components that want to double-check DOM presence
export function isPopupPresentInDOM(): boolean {
  if (typeof document === 'undefined') return false
  try {
    return document.body.getAttribute('data-locale-open') === '1' || !!document.querySelector('.entry-locale-popup')
  } catch {
    return false
  }
}

// Initialize immediately
try { initLocaleGate() } catch {}
