/**
 * Constants for AdInterstitial
 * Popup ad content is managed in Sanity (advertisement type, placement: "popup").
 */

export const CAROUSEL_INTERVAL = 5000 // 5 seconds
export const SCROLL_THRESHOLD = 0.5   // 50% scroll depth

export type PopupAd = {
    imageUrl: string
    targetUrl: string
    alt?: string
}
