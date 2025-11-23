/**
 * Main Portable Text processor
 * Orchestrates all transformations in the correct order
 */

import { sanitizeBlocks } from './sanitization'
import { parseInlineMdToSpans, convertMarkdownHeading } from './markdown'
import { normalizeBlocksForHeadings } from './headings'
import { normalizeBulletLists } from './lists'
import { formatInterviewQA } from './interview'

/**
 * Process Portable Text blocks through all transformations
 * Order matters - each transformation builds on the previous
 */
export function processPortableText(
    value: any,
    options: {
        interviewMode?: boolean
        envInterviewEnabled?: boolean
    } = {}
): any[] {
    // Normalize input to array
    const blocks = Array.isArray(value)
        ? value
        : value && typeof value === 'object' && (value as any)._type === 'block'
            ? [value]
            : typeof value === 'string'
                ? [{
                    _type: 'block',
                    style: 'normal',
                    markDefs: [],
                    children: [{ _type: 'span', text: String(value), marks: [] }]
                }]
                : []

    if (!blocks || blocks.length === 0) return []

    // Step 1: Sanitize (remove RTF noise, image paths, etc.)
    let processed = sanitizeBlocks(blocks)

    // Step 2: Apply inline markdown parsing to each block's children
    processed = processed.map((b) => {
        if (!b || b._type !== 'block') return b

        const children = Array.isArray(b.children) ? b.children : []

        // Parse markdown in each child's text
        const parsedChildren = children.flatMap((c: any) =>
            parseInlineMdToSpans(String(c?.text || ''))
        ).filter((c: any) => Boolean(String(c?.text || '').trim()))

        // Check for markdown heading markers and convert
        const { children: finalChildren, style } = convertMarkdownHeading(
            parsedChildren,
            b.style
        )

        return { ...b, children: finalChildren, style: style || b.style }
    })

    // Step 3: Upgrade heading-like paragraphs
    processed = normalizeBlocksForHeadings(processed)

    // Step 4: Convert bullet glyphs to list items
    processed = normalizeBulletLists(processed)

    // Step 5: Format interview Q&A (if enabled)
    const interviewModeResolved = typeof options.interviewMode === 'boolean'
        ? options.interviewMode
        : options.envInterviewEnabled

    if (interviewModeResolved) {
        processed = formatInterviewQA(processed)
    }

    return processed
}
