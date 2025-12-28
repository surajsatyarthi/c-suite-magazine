import { create } from 'zustand'

const SESSION_KEY = 'popup-ad-shown-session'

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
}

export const useAdStore = create<AdState>((set) => ({
    isOpen: false,
    hasShown: false,
    content: null,

    openAd: (content) => set((state) => {
        // Mark as shown in session storage
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY, '1')
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
