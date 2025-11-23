/**
 * Inline markdown parser for Portable Text
 * Converts **bold**, *italic*, __underline__ to Portable Text marks
 */

type Span = {
    _type: 'span'
    text: string
    marks: string[]
}

/**
 * Parse inline markdown syntax and convert to Portable Text spans
 * Handles: **bold**, *italic*, __underline__, and removes `backticks`
 */
export function parseInlineMdToSpans(input: string): Span[] {
    const spans: Span[] = []
    let remaining = String(input || '')

    const push = (txt: string, marks: string[] = []) => {
        const t = String(txt || '')
        if (!t.trim()) return
        spans.push({ _type: 'span', text: t, marks })
    }

    while (remaining.length) {
        const boldIdx = remaining.indexOf('**')
        const underlineIdx = remaining.indexOf('__')
        const italicIdx = remaining.indexOf('*')

        const nextIdx = Math.min(
            boldIdx >= 0 ? boldIdx : Infinity,
            underlineIdx >= 0 ? underlineIdx : Infinity,
            italicIdx >= 0 ? italicIdx : Infinity
        )

        // No more markdown found
        if (nextIdx === Infinity) {
            // Strip inline code backticks and add remaining text
            push(remaining.replace(/`+/g, ''))
            break
        }

        // Add plain text before markdown marker
        if (nextIdx > 0) {
            push(remaining.slice(0, nextIdx).replace(/`+/g, ''))
            remaining = remaining.slice(nextIdx)
        }

        // Process **bold**
        if (remaining.startsWith('**')) {
            const end = remaining.indexOf('**', 2)
            if (end > 2) {
                push(remaining.slice(2, end), ['strong'])
                remaining = remaining.slice(end + 2)
            } else {
                // Unmatched marker; treat as literal
                push('**')
                remaining = remaining.slice(2)
            }
            continue
        }

        // Process __underline__
        if (remaining.startsWith('__')) {
            const end = remaining.indexOf('__', 2)
            if (end > 2) {
                push(remaining.slice(2, end), ['underline'])
                remaining = remaining.slice(end + 2)
            } else {
                push('__')
                remaining = remaining.slice(2)
            }
            continue
        }

        // Process *italic*
        if (remaining.startsWith('*')) {
            const end = remaining.indexOf('*', 1)
            if (end > 1) {
                push(remaining.slice(1, end), ['em'])
                remaining = remaining.slice(end + 1)
            } else {
                push('*')
                remaining = remaining.slice(1)
            }
            continue
        }
    }

    return spans.length ? spans : [{ _type: 'span', text: input, marks: [] }]
}

/**
 * Convert markdown heading markers (# ## ###) to Portable Text styles
 * Modifies the first child text and returns the appropriate style
 */
export function convertMarkdownHeading(children: any[], currentStyle?: string): {
    children: any[]
    style?: string
} {
    if (!children[0] || typeof children[0].text !== 'string') {
        return { children, style: currentStyle }
    }

    const match = children[0].text.match(/^\s*(#{1,6})\s+(.*)$/)
    if (!match) {
        return { children, style: currentStyle }
    }

    const level = match[1].length
    const newText = match[2]

    const newChildren = [
        { ...children[0], text: newText },
        ...children.slice(1)
    ]

    const newStyle = (!currentStyle || currentStyle === 'normal')
        ? `h${level}`
        : currentStyle

    return { children: newChildren, style: newStyle }
}
