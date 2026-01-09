/**
 * Calculate reading time from Sanity portable text content
 * 
 * @param body - Sanity portable text blocks (array of block objects)
 * @param wordsPerMinute - Reading speed (default: 200 wpm, industry standard)
 * @returns Reading time in minutes (minimum 1 minute)
 */
export function calculateReadingTime(
    body: any[] | null | undefined,
    wordsPerMinute: number = 200
): number {
    if (!body || !Array.isArray(body) || body.length === 0) {
        return 1; // Minimum 1 minute for empty or invalid content
    }

    let totalWords = 0;

    // Extract text from all blocks
    for (const block of body) {
        // Handle text blocks
        if (block._type === 'block' && block.children) {
            for (const child of block.children) {
                if (child.text && typeof child.text === 'string') {
                    totalWords += countWords(child.text);
                }
            }
        }

        // Handle image captions (if they have text)
        if (block._type === 'image' && block.caption) {
            totalWords += countWords(block.caption);
        }
    }

    // Calculate reading time (minimum 1 minute)
    const readingTimeMinutes = Math.max(1, Math.round(totalWords / wordsPerMinute));

    return readingTimeMinutes;
}

/**
 * Count words in a text string
 * Handles various text formats and punctuation
 */
function countWords(text: string): number {
    if (!text || typeof text !== 'string') {
        return 0;
    }

    // Remove extra whitespace and split by whitespace
    const words = text
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .split(' ')
        .filter(word => word.length > 0); // Filter out empty strings

    return words.length;
}
