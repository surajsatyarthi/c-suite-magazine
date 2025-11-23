/**
 * Heading detection and normalization
 * Converts paragraph text that looks like headings into proper h2/h3 elements
 */

import { extractTextFromChildren } from './textUtils'

/**
 * Heuristic to detect if plain text should be a heading
 * Criteria:
 * - Short (<=60 chars, <=8 words)
 * - No sentence-ending punctuation
 * - Mostly capitalized words (70%+)
 * - No commas or colons
 */
export function isLikelyHeadingText(text: string): boolean {
    const t = String(text || '').trim()
    if (!t) return false

    // Reject sentences that end with punctuation
    if (/[\.!?]$/.test(t)) return false

    const words = t.split(/\s+/).filter(Boolean)

    // Strict heuristic: very short, no commas/colons, and clearly title-like
    if (words.length <= 8 && t.length <= 60 && !/[,:]/.test(t)) {
        const caps = words.filter(w => /^[A-Z]/.test(w)).length
        return caps >= Math.max(2, Math.ceil(words.length * 0.7))
    }

    return false
}

/**
 * Upgrade heading-like paragraphs to proper heading styles
 * First candidate → h2, subsequent → h3
 * Limited to 2 conversions max to avoid overuse
 */
export function normalizeBlocksForHeadings(blocks: any[]): any[] {
    try {
        let seenFirstHeadingCandidate = false
        let convertedCount = 0

        return (blocks || []).map((b, idx) => {
            // Only process 'block' type with 'normal' style
            if (!b || b._type !== 'block') return b
            if (b.style && b.style !== 'normal') return b
            if (b.listItem) return b // Don't convert list items

            const text = extractTextFromChildren(b.children || [])
            if (!isLikelyHeadingText(text)) return b

            // Cap heading conversions to avoid overuse
            if (convertedCount >= 2) return b

            // Avoid converting consecutive blocks
            const prev = (blocks || [])[idx - 1]
            if (prev && prev._type === 'block' && (prev.style === 'h2' || prev.style === 'h3')) {
                return b
            }

            // First candidate → h2, subsequent → h3
            const style = !seenFirstHeadingCandidate ? 'h2' : 'h3'
            seenFirstHeadingCandidate = true
            convertedCount++

            return { ...b, style }
        })
    } catch {
        return blocks
    }
}
