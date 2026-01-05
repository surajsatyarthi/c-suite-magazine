import { create } from 'zustand'

const TIMESTAMP_KEY = 'popup-ad-last-shown'
const COOLDOWN_HOURS = 2 // Show popup again after 2 hours

export interface AdContent {
    /** The URL of the ad image to display */
    image: string
    /** The target URL when the ad is clicked */
    href: string
    /** Accessibility text and title attribute */
    title: string
}

interface AdState {
    isOpen: boolean
    hasShown: boolean // Prevent multiple triggers per session/page-load if needed
    content: AdContent[] | null

    // Actions
    openAd: (content: AdContent | AdContent[]) => void
    closeAd: () => void
    reset: () => void
    canShowAd: () => boolean
}

// Check if enough time has passed since last popup
function canShowPopup(): boolean {
    if (typeof window === 'undefined') return false

    try {
        const lastShown = localStorage.getItem(TIMESTAMP_KEY)
        if (!lastShown) return true // Never shown before

        const lastShownTime = parseInt(lastShown, 10)
        const now = Date.now()
        const hoursPassed = (now - lastShownTime) / (1000 * 60 * 60)

        return hoursPassed >= COOLDOWN_HOURS
    } catch {
        return true // If error, allow showing
    }
}

export const useAdStore = create<AdState>((set) => ({
    isOpen: false,
    hasShown: false,
    content: null,

    canShowAd: () => canShowPopup(),

    openAd: (content) => set((state) => {
        // Only open if cooldown period has passed
        if (!canShowPopup()) {
            return state // Don't open, return current state
        }

        // Mark timestamp in localStorage
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(TIMESTAMP_KEY, Date.now().toString())
            } catch {}
        }

        const newContent = Array.isArray(content) ? content : [content]

        return {
            isOpen: true,
            hasShown: true,
            content: newContent
        }
    }),

    closeAd: () => set({ isOpen: false }),

    reset: () => set({ isOpen: false, hasShown: false, content: null })
}))
