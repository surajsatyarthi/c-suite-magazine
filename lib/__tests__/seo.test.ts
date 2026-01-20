import { describe, it, expect } from 'vitest'
import { 
  generateMetadata, 
  generateViewport, 
  generateStructuredData,
  defaultKeywords 
} from '../seo'

describe('SEO Functions', () => {
  describe('generateMetadata', () => {
    describe('default values', () => {
      it('should return default metadata when no props provided', () => {
        const metadata = generateMetadata()
        
        expect(metadata.title).toContain('C-Suite Magazine')
        expect(metadata.description).toContain('premium magazine')
        expect(metadata.keywords).toBeDefined()
      })

      it('should include robots directive', () => {
        const metadata = generateMetadata()
        expect(metadata.robots).toBe('index, follow')
      })

      it('should include favicon configuration', () => {
        const metadata = generateMetadata()
        expect(metadata.icons).toBeDefined()
      })
    })

    describe('custom values', () => {
      it('should append site name to custom title', () => {
        const metadata = generateMetadata({ title: 'CEO Interview' })
        expect(metadata.title).toBe('CEO Interview | C-Suite Magazine')
      })

      it('should use custom description', () => {
        const customDesc = 'A custom description for this page'
        const metadata = generateMetadata({ description: customDesc })
        expect(metadata.description).toBe(customDesc)
      })

      it('should join keywords array', () => {
        const metadata = generateMetadata({ keywords: ['AI', 'Leadership', 'Tech'] })
        expect(metadata.keywords).toBe('AI, Leadership, Tech')
      })

      it('should set noIndex when specified', () => {
        const metadata = generateMetadata({ noIndex: true })
        expect(metadata.robots).toBe('noindex, nofollow')
      })
    })

    describe('Open Graph configuration', () => {
      it('should include OpenGraph data', () => {
        const metadata = generateMetadata({
          title: 'Test Article',
          description: 'Test description',
          image: 'https://example.com/image.jpg',
          url: 'https://example.com/article'
        })

        expect(metadata.openGraph).toBeDefined()
        expect(metadata.openGraph?.title).toContain('Test Article')
        expect(metadata.openGraph?.description).toBe('Test description')
        expect(metadata.openGraph?.url).toBe('https://example.com/article')
      })

      it('should configure article-specific OG properties', () => {
        const metadata = generateMetadata({
          type: 'article',
          publishedTime: '2025-01-15',
          section: 'Leadership',
          tags: ['CEO', 'Strategy']
        })

        expect(metadata.openGraph).toBeDefined()
      })
    })

    describe('Twitter card configuration', () => {
      it('should include Twitter card data', () => {
        const metadata = generateMetadata({
          title: 'Test',
          description: 'Description'
        })

        expect(metadata.twitter).toBeDefined()
        expect(metadata.twitter).toBeDefined()
      })
    })

    describe('canonical URL', () => {
      it('should set canonical URL in alternates', () => {
        const url = 'https://csuitemagazine.global/article/test'
        const metadata = generateMetadata({ url })
        
        expect(metadata.alternates?.canonical).toBe(url)
      })
    })
  })

  describe('generateViewport', () => {
    it('should return viewport configuration', () => {
      const viewport = generateViewport()
      
      expect(viewport.width).toBe('device-width')
      expect(viewport.initialScale).toBe(1)
      expect(viewport.themeColor).toBe('#082945')
    })
  })

  describe('generateStructuredData', () => {
    describe('organization schema', () => {
      it('should generate organization structured data', () => {
        const data = generateStructuredData('organization', {})
        
        expect(data?.['@context']).toBe('https://schema.org')
        expect(data?.['@type']).toBe('Organization')
        expect(data?.name).toBe('C-Suite Magazine')
        expect(data?.url).toBe('https://csuitemagazine.global')
      })

      it('should include social media links', () => {
        const data = generateStructuredData('organization', {})
        
        expect(data?.sameAs).toContain('https://www.linkedin.com/company/csuite-magazine')
        expect(data?.sameAs).toContain('https://twitter.com/csuitemagazine')
      })
    })

    describe('article schema', () => {
      it('should generate article structured data', () => {
        const articleData = {
          title: 'CEO Interview',
          description: 'An exclusive interview',
          image: 'https://example.com/image.jpg',
          writer: 'John Smith',
          publishedTime: '2025-01-15',
          url: 'https://csuitemagazine.global/article/test'
        }
        
        const data = generateStructuredData('article', articleData)
        
        expect(data?.['@type']).toBe('Article')
        expect(data?.headline).toBe('CEO Interview')
        expect(data?.description).toBe('An exclusive interview')
        expect(data?.creator?.name).toBe('John Smith')
      })

      it('should include publisher information', () => {
        const data = generateStructuredData('article', { title: 'Test' })
        
        expect(data?.publisher?.['@type']).toBe('Organization')
        expect(data?.publisher?.name).toBe('C-Suite Magazine')
      })

      it('should format reading time correctly', () => {
        const data = generateStructuredData('article', {
          title: 'Test',
          readTime: 5
        })
        
        expect(data?.timeRequired).toBe('PT5M')
      })
    })

    describe('breadcrumb schema', () => {
      it('should generate breadcrumb structured data', () => {
        const breadcrumbData = {
          items: [
            { name: 'Home', url: 'https://csuitemagazine.global' },
            { name: 'Leadership', url: 'https://csuitemagazine.global/category/leadership' },
            { name: 'Article', url: 'https://csuitemagazine.global/article/test' }
          ]
        }
        
        const data = generateStructuredData('breadcrumb', breadcrumbData)
        
        expect(data?.['@type']).toBe('BreadcrumbList')
        expect(data?.itemListElement).toHaveLength(3)
        expect(data?.itemListElement[0].position).toBe(1)
        expect(data?.itemListElement[2].position).toBe(3)
      })
    })

    describe('unknown type handling', () => {
      it('should return null for unknown type', () => {
        // @ts-expect-error Testing unknown type
        const data = generateStructuredData('unknown', {})
        expect(data).toBeNull()
      })
    })
  })

  describe('defaultKeywords', () => {
    it('should export a list of default keywords', () => {
      expect(Array.isArray(defaultKeywords)).toBe(true)
      expect(defaultKeywords.length).toBeGreaterThan(0)
      expect(defaultKeywords).toContain('CEO')
      expect(defaultKeywords).toContain('leadership')
    })
  })
})
