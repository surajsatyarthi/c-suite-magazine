import { describe, it, expect } from 'vitest'
import { sanitizeText, sanitizeTitle, sanitizeExcerpt } from '../text'

describe('Text Sanitization Functions', () => {
  describe('sanitizeText', () => {
    it('should return empty string for null/undefined input', () => {
      expect(sanitizeText(undefined)).toBe('')
      expect(sanitizeText('')).toBe('')
    })

    it('should remove Markdown image syntax', () => {
      const input = 'Check this ![alt text](http://example.com/image.png) out'
      expect(sanitizeText(input)).toBe('Check this out')
    })

    it('should remove Markdown link syntax but keep link text', () => {
      const input = 'Visit [our website](https://example.com) for more'
      expect(sanitizeText(input)).toBe('Visit our website for more')
    })

    it('should remove inline code backticks', () => {
      const input = 'Use the `npm install` command'
      expect(sanitizeText(input)).toBe('Use the command')
    })

    it('should remove code blocks', () => {
      const input = 'Before ```\ncode here\n``` After'
      expect(sanitizeText(input)).toBe('Before After')
    })

    it('should remove Markdown formatting characters', () => {
      const input = '**bold** and __underline__ and *italic*'
      expect(sanitizeText(input)).toBe('bold and underline and italic')
    })

    it('should remove Markdown headers', () => {
      const input = '# Header\n## Subheader\nContent'
      expect(sanitizeText(input)).toBe('Header Subheader Content')
    })

    it('should remove RTF control sequences', () => {
      const input = 'rtf1ansi Some text cocoartf123'
      const result = sanitizeText(input)
      // The function removes rtf1*, cocoartf* patterns
      expect(result).toContain('Some text')
      expect(result).not.toMatch(/rtf1/i)
      expect(result).not.toMatch(/cocoartf/i)
    })

    it('should collapse multiple whitespace', () => {
      const input = 'Too    many    spaces'
      expect(sanitizeText(input)).toBe('Too many spaces')
    })

    it('should handle mixed markdown and RTF artifacts', () => {
      const input = '**Bold** rtf1ansi [link](url) fonttbl'
      expect(sanitizeText(input)).toBe('Bold link')
    })
  })

  describe('sanitizeTitle', () => {
    it('should use sanitizeText under the hood', () => {
      const input = '**CEO Interview** - rtf1'
      expect(sanitizeTitle(input)).toBe('CEO Interview -')
    })

    it('should handle normal titles', () => {
      expect(sanitizeTitle('John Smith - CEO of Acme Corp')).toBe('John Smith - CEO of Acme Corp')
    })
  })

  describe('sanitizeExcerpt', () => {
    it('should return empty for null/undefined', () => {
      expect(sanitizeExcerpt(undefined)).toBe('')
      expect(sanitizeExcerpt('')).toBe('')
    })

    it('should sanitize the excerpt text', () => {
      const input = '**Bold** excerpt with [link](url)'
      expect(sanitizeExcerpt(input)).toBe('Bold excerpt with link')
    })

    it('should return empty if excerpt matches title exactly', () => {
      const title = 'CEO Interview'
      const excerpt = 'CEO Interview'
      expect(sanitizeExcerpt(excerpt, title)).toBe('')
    })

    it('should return empty if excerpt starts with title (case insensitive)', () => {
      const title = 'CEO Interview'
      const excerpt = 'ceo interview with more text'
      expect(sanitizeExcerpt(excerpt, title)).toBe('')
    })

    it('should return excerpt if different from title', () => {
      const title = 'CEO Interview'
      const excerpt = 'An exclusive look at leadership'
      expect(sanitizeExcerpt(excerpt, title)).toBe('An exclusive look at leadership')
    })

    it('should work without title parameter', () => {
      const excerpt = 'Just an excerpt'
      expect(sanitizeExcerpt(excerpt)).toBe('Just an excerpt')
    })
  })
})
