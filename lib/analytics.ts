/**
 * Analytics utility for tracking ad events in Google Analytics 4
 *
 * Events tracked:
 * - ad_impression: When an ad becomes visible (50%+ in viewport)
 * - ad_click: When user clicks on an ad
 * - ad_popup_view: When popup ad is shown
 * - ad_popup_close: When popup ad is closed
 */

declare global {
    interface Window {
        gtag?: (...args: any[]) => void
    }
}

type AdEventParams = {
    ad_id?: string
    ad_name: string
    ad_placement: 'sidebar' | 'in-article' | 'popup' | 'scroll-trigger'
    ad_url?: string
    article_path?: string
}

/**
 * Track ad impression (when ad becomes visible)
 */
export function trackAdImpression(params: AdEventParams): void {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'ad_impression', {
        ad_id: params.ad_id,
        ad_name: params.ad_name,
        ad_placement: params.ad_placement,
        ad_url: params.ad_url,
        page_path: params.article_path || window.location.pathname,
    })
}

/**
 * Track ad click
 */
export function trackAdClick(params: AdEventParams): void {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'ad_click', {
        ad_id: params.ad_id,
        ad_name: params.ad_name,
        ad_placement: params.ad_placement,
        ad_url: params.ad_url,
        page_path: params.article_path || window.location.pathname,
    })
}

/**
 * Track popup ad view
 */
export function trackPopupView(params: AdEventParams): void {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'ad_popup_view', {
        ad_id: params.ad_id,
        ad_name: params.ad_name,
        ad_placement: params.ad_placement,
        ad_url: params.ad_url,
        page_path: params.article_path || window.location.pathname,
    })
}

/**
 * Track popup ad close (without clicking)
 */
export function trackPopupClose(params: Omit<AdEventParams, 'ad_url'>): void {
    if (typeof window === 'undefined' || !window.gtag) return

    window.gtag('event', 'ad_popup_close', {
        ad_id: params.ad_id,
        ad_name: params.ad_name,
        ad_placement: params.ad_placement,
        page_path: params.article_path || window.location.pathname,
    })
}
