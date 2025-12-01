import { create } from 'zustand'

export interface AdContent {
    image: string
    href?: string
    title?: string
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
