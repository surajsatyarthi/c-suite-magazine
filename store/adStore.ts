import { create } from 'zustand'

export interface AdContent {
    image: string
    href?: string
    title?: string
}

interface AdState {
    isOpen: boolean
    hasShown: boolean // Prevent multiple triggers per session/page-load if needed
    content: AdContent | null

    // Actions
    openAd: (content: AdContent) => void
    closeAd: () => void
    reset: () => void
}

export const useAdStore = create<AdState>((set) => ({
    isOpen: false,
    hasShown: false,
    content: null,

    openAd: (content) => set((state) => {
        // Optional: Only show once per page load? 
        // For now, we'll allow re-triggering if the user closes it and scrolls back? 
        // Or maybe block it if already shown. 
        // Let's block it if currently open, but allow re-open if closed?
        // User requirement: "displayed when user sees the same ad". 
        // Usually this means "trigger once".
        // Allow re-triggering to support sequential ads (Patek -> Gulfstream)
        // if (state.hasShown) return {}

        return {
            isOpen: true,
            hasShown: true,
            content
        }
    }),

    closeAd: () => set({ isOpen: false }),

    reset: () => set({ isOpen: false, hasShown: false, content: null })
}))
