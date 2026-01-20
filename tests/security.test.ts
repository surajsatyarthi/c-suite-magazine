import { describe, it, expect } from 'vitest'
import { safeJsonLd, sanitizeHtml } from '../lib/security-pure'

describe('Security Utilities', () => {
  describe('safeJsonLd', () => {
    it('should correctly escape < character to prevent LD+JSON injection', () => {
      const dangerousData = {
        title: 'Dangerous Article',
        content: '</script><script>alert("xss")</script>'
      }
      
      const result = safeJsonLd(dangerousData)
      
      // The output should be an object with __html property
      expect(result).toHaveProperty('__html')
      
      // safeJsonLd should escape the <
      expect(result.__html).toContain('\\u003c/script')
      expect(result.__html).toContain('\\u003cscript')
      // Ensure it doesn't contain raw <script
      expect(result.__html).not.toContain('</script>')
      expect(result.__html).not.toContain('<script>')
    })

    it('should return valid JSON when parsed', () => {
      const data = { foo: 'bar', baz: 123, html: '<div>' }
      const result = safeJsonLd(data)
      
      // Even with escaping, it should still be valid JSON
      const parsed = JSON.parse(result.__html)
      expect(parsed).toEqual(data)
    })
  })

  describe('sanitizeHtml', () => {
    it('should strip all HTML tags', () => {
      const html = '<p>Hello <b>World</b>!</p><script>alert(1)</script>'
      expect(sanitizeHtml(html)).toBe('Hello World!')
    })

    it('should strip everything between brackets and brackets themselves', () => {
      const html = '&lt;div&gt;Test&lt;/div&gt;'
      // sanitizeHtml(html) -> &lt;div&gt;Test&lt;/div&gt; -> <div>Test</div> -> Test (after final char strip)
      expect(sanitizeHtml(html)).toBe('Test')
    })
  })
})
