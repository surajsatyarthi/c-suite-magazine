import { describe, it, expect } from 'vitest'
import { calculateReadingTime } from '../calculateReadingTime'

describe('calculateReadingTime', () => {
  describe('basic functionality', () => {
    it('should return 1 minute for empty/null content', () => {
      expect(calculateReadingTime(null)).toBe(1)
      expect(calculateReadingTime(undefined)).toBe(1)
      expect(calculateReadingTime([])).toBe(1)
    })

    it('should calculate reading time based on word count', () => {
      // 200 words at 200 wpm = 1 minute
      const body = createTextBlocks(200)
      expect(calculateReadingTime(body)).toBe(1)
    })

    it('should round to nearest minute', () => {
      // 300 words at 200 wpm = 1.5 -> rounds to 2 minutes
      const body = createTextBlocks(300)
      expect(calculateReadingTime(body)).toBe(2)
    })

    it('should handle custom words per minute', () => {
      // 400 words at 100 wpm = 4 minutes
      const body = createTextBlocks(400)
      expect(calculateReadingTime(body, 100)).toBe(4)
    })
  })

  describe('content extraction', () => {
    it('should extract text from block children', () => {
      const body = [
        {
          _type: 'block',
          children: [
            { text: 'Hello world' },
            { text: 'More text here' }
          ]
        }
      ]
      // 5 words at 200 wpm = 0.025 -> minimum 1 minute
      expect(calculateReadingTime(body)).toBe(1)
    })

    it('should extract text from image captions', () => {
      const body = [
        {
          _type: 'image',
          caption: 'A beautiful sunset over the mountains'
        },
        {
          _type: 'block',
          children: [{ text: 'Some text' }]
        }
      ]
      // 8 words total
      expect(calculateReadingTime(body)).toBe(1)
    })

    it('should skip blocks without children', () => {
      const body = [
        { _type: 'block' },
        { _type: 'divider' },
        {
          _type: 'block',
          children: [{ text: 'Only text' }]
        }
      ]
      expect(calculateReadingTime(body)).toBe(1)
    })

    it('should skip children without text property', () => {
      const body = [
        {
          _type: 'block',
          children: [
            { text: 'Valid text' },
            { something: 'else' },
            { text: 123 } // non-string
          ]
        }
      ]
      expect(calculateReadingTime(body)).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle very long articles', () => {
      // 2000 words at 200 wpm = 10 minutes
      const body = createTextBlocks(2000)
      expect(calculateReadingTime(body)).toBe(10)
    })

    it('should handle single word', () => {
      const body = [{
        _type: 'block',
        children: [{ text: 'Word' }]
      }]
      expect(calculateReadingTime(body)).toBe(1)
    })

    it('should handle text with extra whitespace', () => {
      const body = [{
        _type: 'block',
        children: [{ text: '  Multiple    spaces   between   words  ' }]
      }]
      // 4 words
      expect(calculateReadingTime(body)).toBe(1)
    })

    it('should handle non-array input gracefully', () => {
      // @ts-expect-error Testing invalid input
      expect(calculateReadingTime('not an array')).toBe(1)
      // @ts-expect-error Testing invalid input
      expect(calculateReadingTime({})).toBe(1)
    })
  })
})

// Helper function to create text blocks with specific word count
function createTextBlocks(wordCount: number): any[] {
  const wordsPerBlock = 50
  const blocks: any[] = []
  let remaining = wordCount

  while (remaining > 0) {
    const words = Math.min(remaining, wordsPerBlock)
    blocks.push({
      _type: 'block',
      children: [{
        text: Array(words).fill('word').join(' ')
      }]
    })
    remaining -= words
  }

  return blocks
}
