/**
 * Text utility functions for Portable Text processing
 * Extracted from PortableBody.tsx for better testability
 */

/**
 * Convert text to URL-friendly slug
 * Used for heading IDs
 */
export function slugify(text: string): string {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
}

/**
 * Extract plain text from Portable Text children array
 * Handles nested structures and type safety
 */
export function extractTextFromChildren(children: any[]): string {
    try {
        return (children || [])
            .map((c: any) => String(c?.text || ''))
            .join(' ')
            .trim()
    } catch {
        return ''
    }
}
