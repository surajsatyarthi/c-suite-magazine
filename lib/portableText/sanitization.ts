/**
 * Sanitization functions for Portable Text
 * Removes RTF artifacts, image paths, and other noise from imported content
 */

import { extractTextFromChildren } from './textUtils'

/**
 * Detect if text is an image file path or markdown image syntax
 */
export function isImagePathText(s: string): boolean {
    const t = String(s || '').trim()
    if (!t) return false

    // Markdown image syntax: ![alt](url)
    if (/!\[[^\]]*\]\([^\)]*\)/.test(t)) return true

    // HTTP/HTTPS URLs ending with image extensions
    if (/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?[^\s]*)?$)/i.test(t)) return true

    // File paths ending with image extensions
    if (/([^\s]+\/)?[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(t)) return true

    // Paths starting with images/ or assets/
    if (/^(images|image|assets|static)\/[\w\-\/]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(t)) return true

    return false
}

/**
 * Detect RTF import noise (font names, platform markers, etc.)
 */
export function isRtfNoise(t: string): boolean {
    const s = String(t || '').trim()
    if (!s) return false

    // Common RTF tokens and platform-specific headers
    if (/^(rtf\d+|ansicpg\d+|cocoartf\d+|cocoatextscaling\d+|cocoaplatform\d+|fonttbl|colortbl|expandedcolortbl|pard|viewkind\d+|f\d+|cf\d+|lang\d+)$/i.test(s)) {
        return true
    }

    // Font names with optional tab markers
    if (/^(Times(?:\s+New)?\s*Roman|Times-?Roman)(\s*;\s*)?(ef?tab\d+)?$/i.test(s)) {
        return true
    }

    // Bare tab markers
    if (/^ef?tab\d+$/i.test(s)) {
        return true
    }

    return false
}

/**
 * Detect publish/updated date lines that should be removed from content
 */
export function isPublishDateLine(t: string): boolean {
    const s = String(t || '').trim()
    if (!s) return false

    // Common patterns: "Published on", "Updated:", etc.
    if (/^(published|updated|last\s+updated)\s*(on|:)?\s*/i.test(s)) {
        return true
    }

    return false
}

/**
 * Main sanitization function - filters out unwanted blocks
 */
export function sanitizeBlocks(blocks: any[]): any[] {
    try {
        return (blocks || [])
            .map((b) => {
                // Allow only known safe types
                if (!b) return null
                if (b._type && b._type !== 'block' && b._type !== 'image') return null
                if (b._type !== 'block') return b

                const children = Array.isArray(b.children) ? b.children : []
                const wholeText = extractTextFromChildren(children)

                // Drop blocks with various types of noise
                if (isRtfNoise(wholeText)) return null
                if (isPublishDateLine(wholeText)) return null
                if (/^\s*---\s*$/.test(wholeText)) return null // HR markers
                if (/```/.test(wholeText)) return null // Code fence markers
                if (isImagePathText(wholeText)) return null

                // Filter out image paths from children
                const filteredChildren = children
                    .filter((c: any) => !isImagePathText(String(c?.text || '')))
                    .filter((c: any) => Boolean(String(c?.text || '').trim()))

                // Drop block if filtering left it empty
                const afterText = extractTextFromChildren(filteredChildren)
                if (!afterText.trim()) return null

                return { ...b, children: filteredChildren }
            })
            .filter(Boolean)
    } catch {
        return blocks
    }
}
