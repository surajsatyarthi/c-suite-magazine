/**
 * Bullet list normalization
 * Converts paragraphs starting with • - * into semantic list items
 * Bolds labels before first colon
 */

import { extractTextFromChildren } from './textUtils'

/**
 * Check if text starts with bullet glyph
 */
function startsWithBullet(text: string): boolean {
    return /^(\s*[•\-*]\s+)/.test(text)
}

/**
 * Remove bullet glyph from start of text
 */
function stripBullet(text: string): string {
    return String(text || '').replace(/^(\s*[•\-*]\s+)/, '').trim()
}

/**
 * Convert bullet glyphs to semantic list items
 * Also bolds the label before the first colon if present
 */
export function normalizeBulletLists(blocks: any[]): any[] {
    try {
        return (blocks || []).map((b) => {
            if (!b || b._type !== 'block') return b

            const rawExisting = extractTextFromChildren(Array.isArray(b.children) ? b.children : [])

            // If already a list item, only ensure label before colon is bolded
            if (b.listItem) {
                if (!rawExisting) return b

                const colonIndex = rawExisting.indexOf(':')
                if (colonIndex > 0) {
                    const label = rawExisting.slice(0, colonIndex).trim()
                    const rest = rawExisting.slice(colonIndex + 1).trim()
                    const children = [
                        { _type: 'span', text: label, marks: ['strong'] },
                        { _type: 'span', text: rest ? `: ${rest}` : ':', marks: [] },
                    ]
                    return { ...b, children }
                }
                return b
            }

            // Check if paragraph starts with bullet
            const raw = rawExisting
            if (!raw || !startsWithBullet(raw)) return b

            const withoutBullet = stripBullet(raw)
            const colonIndex = withoutBullet.indexOf(':')

            let children: any[]
            if (colonIndex > 0) {
                const label = withoutBullet.slice(0, colonIndex).trim()
                const rest = withoutBullet.slice(colonIndex + 1).trim()
                children = [
                    { _type: 'span', text: label, marks: ['strong'] },
                    { _type: 'span', text: rest ? `: ${rest}` : ':', marks: [] },
                ]
            } else {
                children = [{ _type: 'span', text: withoutBullet, marks: [] }]
            }

            return { ...b, listItem: 'bullet', children }
        })
    } catch {
        return blocks
    }
}
