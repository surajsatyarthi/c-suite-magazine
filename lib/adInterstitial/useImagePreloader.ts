/**
 * Hook to manage Ad Image loading and state
 * Handles image preloading, fallbacks, and display state
 */

import { useState, useEffect } from 'react'
import { ADS, SECONDARY_FALLBACKS, AD_LINK, PopupAd } from './constants'

type UseImagePreloaderProps = {
    shownRef: React.MutableRefObject<boolean>
    forceOpen: boolean
    pathname: string | null
}

export function useImagePreloader({ shownRef, forceOpen, pathname }: UseImagePreloaderProps) {
    const [show, setShow] = useState(false)
    const [ad, setAd] = useState<PopupAd | null>(null)
    const [adIndex, setAdIndex] = useState<number>(0)
    const [aspectRatio, setAspectRatio] = useState<string>('970/550')

    // Reset on route change
    useEffect(() => {
        if (!forceOpen) {
            setShow(false)
            setAdIndex(0)
            setAd(null)
            setAspectRatio('970/550')
        }
    }, [pathname, forceOpen])

    const loadAd = (index: number, onReady?: () => void) => {
        const primary = ADS[index]?.imageUrl
        // Always include broad fallbacks to ensure at least one resolves
        const tryUrls = [primary, ...SECONDARY_FALLBACKS].filter(Boolean) as string[]
        // Fallback SVG if nothing resolves
        const fallbackDataUri =
            'data:image/svg+xml;charset=utf-8,' +
            encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="970" height="550">
           <rect width="100%" height="100%" fill="#111"/>
           <text x="50%" y="50%" fill="#fff" font-size="36" text-anchor="middle" dominant-baseline="middle">Sponsored</text>
         </svg>`
            )

        const setFromImg = (img: HTMLImageElement, src: string) => {
            if (img.naturalWidth && img.naturalHeight) {
                setAspectRatio(`${img.naturalWidth}/${img.naturalHeight}`)
            } else {
                setAspectRatio('970/550')
            }
            setAd({ imageUrl: src, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
            setShow(true)
            setAdIndex(index)
            shownRef.current = true
            try { onReady?.() } catch { }
        }

        const src = tryUrls[0]
        if (!src) {
            setAspectRatio('970/550')
            setAd({ imageUrl: fallbackDataUri, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
            setShow(true)
            setAdIndex(index)
            shownRef.current = true
            try { onReady?.() } catch { }
            return
        }

        const img = new window.Image()
        img.onload = () => setFromImg(img, src)
        img.onerror = () => {
            if (tryUrls.length > 1) {
                const alt = tryUrls[1]!
                const img2 = new window.Image()
                img2.onload = () => setFromImg(img2, alt)
                img2.onerror = () => {
                    setAspectRatio('970/550')
                    setAd({ imageUrl: fallbackDataUri, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
                    setShow(true)
                    setAdIndex(index)
                    shownRef.current = true
                    try { onReady?.() } catch { }
                }
                img2.src = alt
            } else {
                setAspectRatio('970/550')
                setAd({ imageUrl: fallbackDataUri, targetUrl: ADS[index]?.targetUrl || AD_LINK, alt: 'Sponsored' })
                setShow(true)
                setAdIndex(index)
                shownRef.current = true
                try { onReady?.() } catch { }
            }
        }
        img.src = src
    }

    return {
        show,
        setShow,
        ad,
        adIndex,
        setAdIndex,
        aspectRatio,
        loadAd
    }
}
