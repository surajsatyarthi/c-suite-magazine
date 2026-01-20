import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// The security module uses 'server-only' which will fail in test environment
// We need to mock it
vi.mock('server-only', () => ({}))

// Import after mocking
import { sanitizeHtml, safeJsonLd } from '../security'

describe('Security Functions', () => {
  describe('sanitizeHtml', () => {
    describe('basic sanitization', () => {
      it('should return empty string for null/undefined/empty input', () => {
        expect(sanitizeHtml('')).toBe('')
        // @ts-expect-error Testing null input
        expect(sanitizeHtml(null)).toBe('')
        // @ts-expect-error Testing undefined input
        expect(sanitizeHtml(undefined)).toBe('')
      })

      it('should return plain text unchanged', () => {
        expect(sanitizeHtml('Hello World')).toBe('Hello World')
      })

      it('should trim whitespace', () => {
        expect(sanitizeHtml('  Hello World  ')).toBe('Hello World')
      })
    })

    describe('XSS prevention', () => {
      it('should remove script tags', () => {
        const malicious = '<script>alert("XSS")</script>Normal text'
        expect(sanitizeHtml(malicious)).not.toContain('script')
        expect(sanitizeHtml(malicious)).toContain('Normal text')
      })

      it('should remove style tags', () => {
        const malicious = '<style>body { display: none }</style>Visible text'
        expect(sanitizeHtml(malicious)).not.toContain('style')
        expect(sanitizeHtml(malicious)).toContain('Visible text')
      })

      it('should remove all HTML tags', () => {
        const html = '<div><p>Paragraph</p><span>Span</span></div>'
        expect(sanitizeHtml(html)).toBe('ParagraphSpan')
      })

      it('should handle nested malicious content', () => {
        const malicious = '<div onclick="evil()"><script>bad()</script>Safe</div>'
        const result = sanitizeHtml(malicious)
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
        expect(result).toContain('Safe')
      })

      it('should remove angle brackets from output', () => {
        const input = 'Text with < and > characters'
        const result = sanitizeHtml(input)
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
      })
    })

    describe('HTML entity decoding', () => {
      it('should decode &lt; and &gt;', () => {
        const input = 'Compare &lt;a&gt; with &lt;b&gt;'
        const result = sanitizeHtml(input)
        // After decoding, the < and > should be removed
        expect(result).not.toContain('<')
        expect(result).not.toContain('>')
      })

      it('should decode &amp;', () => {
        const input = 'Tom &amp; Jerry'
        expect(sanitizeHtml(input)).toContain('&')
      })

      it('should decode &quot;', () => {
        const input = 'He said &quot;Hello&quot;'
        expect(sanitizeHtml(input)).toContain('"')
      })

      it('should decode &#x27; (apostrophe)', () => {
        const input = "It&#x27;s great"
        expect(sanitizeHtml(input)).toContain("'")
      })
    })

    describe('edge cases', () => {
      it('should handle complex nested scripts', () => {
        const malicious = '<script type="text/javascript">document.write("<script>evil()</script>")</script>'
        const result = sanitizeHtml(malicious)
        expect(result).not.toContain('script')
      })

      it('should handle SVG-based XSS attempts', () => {
        const malicious = '<svg onload="alert(1)">Content</svg>'
        const result = sanitizeHtml(malicious)
        expect(result).not.toContain('svg')
        expect(result).not.toContain('onload')
      })

      it('should handle img onerror XSS attempts', () => {
        const malicious = '<img src="x" onerror="alert(1)">Text'
        const result = sanitizeHtml(malicious)
        expect(result).not.toContain('img')
        expect(result).not.toContain('onerror')
      })
    })
  })

  describe('safeJsonLd', () => {
    it('should return object with __html property', () => {
      const data = { name: 'Test' }
      const result = safeJsonLd(data)
      expect(result).toHaveProperty('__html')
    })

    it('should stringify the data to JSON', () => {
      const data = { name: 'Test', value: 123 }
      const result = safeJsonLd(data)
      expect(result.__html).toContain('Test')
      expect(result.__html).toContain('123')
    })

    it('should escape < characters to prevent script injection', () => {
      const data = { content: '</script><script>evil()</script>' }
      const result = safeJsonLd(data)
      expect(result.__html).not.toContain('</script>')
      expect(result.__html).toContain('\\u003c')
    })

    it('should handle complex nested objects', () => {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test <script>Article</script>',
        author: {
          '@type': 'Person',
          name: 'John <script>Doe</script>'
        }
      }
      const result = safeJsonLd(data)
      expect(result.__html).not.toContain('<script>')
      expect(result.__html).toContain('Test')
      expect(result.__html).toContain('John')
    })

    it('should handle arrays in data', () => {
      const data = {
        items: ['<evil>', 'safe', '</evil>']
      }
      const result = safeJsonLd(data)
      expect(result.__html).not.toContain('<evil>')
      expect(result.__html).toContain('safe')
    })

    it('should handle empty objects', () => {
      const result = safeJsonLd({})
      expect(result.__html).toBe('{}')
    })

    it('should handle null and undefined values', () => {
      const data = { a: null, b: undefined }
      const result = safeJsonLd(data)
      // undefined is not included in JSON.stringify, null is
      expect(result.__html).toContain('null')
      expect(result.__html).not.toContain('undefined')
    })
  })
})
