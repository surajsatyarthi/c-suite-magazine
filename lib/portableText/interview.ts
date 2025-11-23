/**
 * Interview Q&A formatting
 * Detects and formats question-answer blocks for interview articles
 */

import { extractTextFromChildren } from './textUtils'

/**
 * Detect if text is a question
 * Criteria:
 * - Starts with "Q:" or speaker name + ":"
 * - Ends with "?"
 * - Reasonable length (<= 180 chars)
 */
export function isQuestionText(text: string): boolean {
    const t = String(text || '').trim()
    if (!t) return false

    // Explicit Q: marker
    if (/^q\s*:\s*/i.test(t)) return true

    // Speaker name followed by colon
    if (/^([A-Z][a-z]+|Interviewer|Host|Moderator|CEO|CTO|CFO)\s*:\s+/.test(t)) {
        return true
    }

    // Question mark at end (reasonable length)
    if (t.endsWith('?') && t.length <= 180) return true

    return false
}

/**
 * Format interview Q&A blocks
 * - Splits combined Q&A blocks
 * - Marks questions with __qa: 'Q'
 * - Strips speaker labels
 */
export function formatInterviewQA(blocks: any[]): any[] {
    try {
        const result: any[] = []

        for (const b of blocks || []) {
            // Only process block types
            if (!b || b._type !== 'block') {
                result.push(b)
                continue
            }

            const raw = extractTextFromChildren(b.children || [])
            const text = String(raw || '').trim()

            if (!text) {
                result.push(b)
                continue
            }

            // Check if block has Q&A in same paragraph (question? answer)
            const qaMatch = text.match(/(.+?\?)(\s+.+)/)
            if (qaMatch) {
                let qText = qaMatch[1].trim()
                let aText = qaMatch[2].trim()

                // Strip speaker labels from question
                qText = qText.replace(
                    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|Interviewer|Host|Moderator|Editor|Our\s+publication)\s*:\s*/i,
                    ''
                ).trim()

                // Strip speaker labels from answer
                aText = aText.replace(
                    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|Martijn\s+Blanken|Interviewee|Speaker|CEO|CTO|CFO)\s*:\s*/i,
                    ''
                ).trim()

                const qBlock = {
                    ...b,
                    __qa: 'Q',
                    children: [{ _type: 'span', text: qText, marks: [] }],
                    markDefs: [],
                }

                const aBlock = {
                    ...b,
                    __qa: undefined,
                    children: [{ _type: 'span', text: aText, marks: [] }],
                    markDefs: [],
                }

                result.push(qBlock, aBlock)
                continue
            }

            // If just a question, mark it
            if (isQuestionText(text)) {
                result.push({ ...b, __qa: 'Q' })
                continue
            }

            result.push(b)
        }

        return result
    } catch {
        return blocks
    }
}
