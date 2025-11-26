'use client'

import { useEffect, useRef } from 'react'

export default function AdTriggerMarker() {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        // Dispatch custom event to trigger the ad
                        window.dispatchEvent(new CustomEvent('trigger-ad-interstitial'))
                        // Disconnect after triggering once
                        observer.disconnect()
                    }
                }
            },
            { threshold: 0.1 } // Trigger as soon as 10% is visible
        )

        observer.observe(el)

        return () => observer.disconnect()
    }, [])

    // Invisible marker
    return <div ref={ref} className="w-full h-px opacity-0 pointer-events-none" aria-hidden="true" />
}
