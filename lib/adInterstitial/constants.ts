/**
 * Constants for AdInterstitial
 */

export const AD_LINK = 'https://www.patek.com/en/collection/aquanaut/5968r-001'
export const GULFSTREAM_LINK = 'https://www.gulfstream.com/en/aircraft/gulfstream-g700/'

export const CAROUSEL_INTERVAL = 5000 // 5 seconds
export const SCROLL_THRESHOLD = 0.5 // 50% scroll depth

export type PopupAd = {
    imageUrl: string
    targetUrl: string
    alt?: string
}

export const ADS: PopupAd[] = [
    // Use clean filename first; keep variant as secondary
    { imageUrl: '/popup-ad.png', targetUrl: AD_LINK, alt: 'Sponsored' },
    { imageUrl: '/popup-ad 2.png', targetUrl: GULFSTREAM_LINK, alt: 'Sponsored' },
]

// Allow legacy/variant filenames with spaces or hyphens
export const SECONDARY_FALLBACKS = [
    '/popup-ad.png',        // clean filename
    '/popup-ad%202.png',    // encoded space
    '/popup-ad 2.png',      // literal space
    '/popup-ad-2.png',      // hyphenated variant
    '/popup-ad-2.jpg',      // jpg variant
    '/pop%20up%20ad%202.png' // older spaced naming
]
