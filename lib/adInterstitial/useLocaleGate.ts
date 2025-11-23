/**
 * Hook to manage Locale Gate state
 * Ensures ads don't show until the locale popup is dismissed
 */

import { useState, useEffect } from 'react'
import { onLocaleGateChange, localeReady as checkLocaleReady } from '@/lib/localeGate'

export function useLocaleGate() {
    const [localeReady, setLocaleReady] = useState<boolean>(false)

    useEffect(() => {
        // Initialize state on mount (client-only) to avoid hydration mismatch
        try { setLocaleReady(checkLocaleReady()) } catch { }
        // Subscribe to LocaleGate changes
        const unsub = onLocaleGateChange((st) => {
            try { setLocaleReady(st.dismissed && !st.open) } catch { }
        })

        // Listen for custom event
        const onLocaleDismissed = () => {
            try { setLocaleReady(true) } catch { }
        }
        window.addEventListener('localePopupDismissed', onLocaleDismissed, { once: true })

        return () => {
            try { unsub() } catch { }
            try { window.removeEventListener('localePopupDismissed', onLocaleDismissed) } catch { }
        }
    }, [])

    return localeReady
}
