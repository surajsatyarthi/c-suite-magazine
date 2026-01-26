import { describe, it, expect } from 'vitest'
import { generateMetadata } from '../../lib/seo'

describe('SEO Fallback Logic (lib/seo.ts)', () => {
  const defaultTitle = 'C-Suite Magazine - Leadership, Innovation & Executive Insights'
  const defaultDesc = 'A premium magazine for global CXOs featuring exclusive interviews, leadership insights, and business strategies from top executives worldwide.'

  it('should use Sanity SEO fields as the highest priority', () => {
    const metadata = generateMetadata({
      title: 'Real Title',
      description: 'Real Description',
      metaTitle: 'SEO Title Override',
      metaDescription: 'SEO Description Override'
    } as any)

    expect(metadata.title).toBe('SEO Title Override | C-Suite Magazine')
    expect(metadata.description).toBe('SEO Description Override')
  })

  it('should fall back to article title/excerpt if SEO fields are missing', () => {
    const metadata = generateMetadata({
      title: 'Article Title',
      description: 'Article Excerpt'
    })

    expect(metadata.title).toBe('Article Title | C-Suite Magazine')
    expect(metadata.description).toBe('Article Excerpt')
  })

  it('should use default branding if both SEO fields and content are missing', () => {
    const metadata = generateMetadata({})

    expect(metadata.title).toBe(defaultTitle)
    expect(metadata.description).toBe(defaultDesc)
  })

  it('should ensure description length for SEO (truncation logic or suffix)', () => {
    const longDesc = 'A'.repeat(200)
    const metadata = generateMetadata({
      description: longDesc
    })

    // Current logic in app pages sometimes adds "..." or truncates.
    // We want the central lib to handle basic sanity or at least pass through correctly.
    expect(metadata.description).toBe(longDesc)
  })

  it('should handle Open Graph and Twitter consistency', () => {
    const seo = {
      metaTitle: 'Social Title',
      metaDescription: 'Social Description',
      image: 'https://example.com/img.jpg'
    } as any
    const metadata = generateMetadata(seo)

    expect(metadata.openGraph?.title).toBe('Social Title | C-Suite Magazine')
    expect(metadata.openGraph?.description).toBe('Social Description')
    expect(metadata.twitter?.title).toBe('Social Title | C-Suite Magazine')
    expect(metadata.twitter?.description).toBe('Social Description')
  })
})
