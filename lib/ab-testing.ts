/**
 * A/B Testing Framework for Popup Ad Placement
 * 
 * Tests homepage Spotlight trigger vs article page scroll trigger
 */

const AB_VARIANT_KEY = 'popup-ab-variant'

export type PopupVariant = 'homepage' | 'article'

/**
 * Get or assign A/B test variant for popup placement
 * 50/50 split between homepage and article page triggers
 */
export function getPopupVariant(): PopupVariant {
    if (typeof window === 'undefined') return 'article' // SSR fallback

    try {
        // Check if user already has a variant assigned
        const stored = localStorage.getItem(AB_VARIANT_KEY)
        if (stored === 'homepage' || stored === 'article') {
            return stored
        }

        // Assign new variant (50/50 split)
        const variant: PopupVariant = Math.random() < 0.5 ? 'homepage' : 'article'
        localStorage.setItem(AB_VARIANT_KEY, variant)
        return variant
    } catch {
        // If localStorage fails, default to article variant
        return 'article'
    }
}

/**
 * Track A/B test variant in analytics
 * Call this when popup is triggered to record which variant was active
 */
export function trackVariant(variant: PopupVariant) {
    if (typeof window === 'undefined') return

    try {
        // Send to GA4 if available
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'ab_test_variant', {
                experiment_name: 'popup_placement',
                variant: variant,
            })
        }
    } catch (error) {
        console.warn('Failed to track A/B variant:', error)
    }
}

/**
 * Reset variant assignment (for testing purposes)
 * NOT exported - only for debugging in browser console
 */
if (typeof window !== 'undefined') {
    (window as any).__resetPopupVariant = () => {
        localStorage.removeItem(AB_VARIANT_KEY)
        console.log('Popup A/B variant reset. Refresh to get new variant.')
    }
}
