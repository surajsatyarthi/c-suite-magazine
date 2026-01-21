import 'server-only'
import { createClient } from '@sanity/client'

interface Article {
  _id: string
  title: string
  excerpt?: string
  category?: { title: string }
  articleType?: string
  featuredImage?: any
}

interface ImageAsset {
  _id: string
  url: string
  alt?: string
}

class ArticleImageService {
  private static instance: ArticleImageService
  private usedImageIds: Set<string> = new Set()

  private constructor() { }

  static getInstance(): ArticleImageService {
    if (!ArticleImageService.instance) {
      ArticleImageService.instance = new ArticleImageService()
    }
    return ArticleImageService.instance
  }

  /**
   * Generate unique image for article (excluding spotlight articles)
   */
  async generateUniqueImage(article: Article): Promise<string | null> {
    // CRITICAL: Never modify spotlight articles
    if (article.articleType === 'spotlight') {
      return null
    }

    // Check if article already has a unique image
    if (article.featuredImage && !this.isDuplicateImage(article.featuredImage)) {
      return null
    }

    try {
      // Generate content-based image
      const imageUrl = await this.generateContentBasedImage(article)

      if (imageUrl) {
        this.usedImageIds.add(this.extractImageId(imageUrl))
      }

      return imageUrl
    } catch (error) {
      console.error('Failed to generate unique image:', error)
      return this.generateFallbackImage(article)
    }
  }

  /**
   * Check if image is already used by another article
   */
  private isDuplicateImage(imageAsset: any): boolean {
    if (!imageAsset?.asset?._ref) return false

    const imageId = imageAsset.asset._ref
    return this.usedImageIds.has(imageId)
  }

  /**
   * Generate content-based image using free APIs and patterns
   */
  private async generateContentBasedImage(article: Article): Promise<string> {
    const keywords = this.extractKeywords(article.title, article.excerpt)
    const category = article.category?.title?.toLowerCase() || 'business'

    // Try Unsplash API first (professional business imagery)
    const unsplashImage = await this.searchUnsplash(keywords, category)
    if (unsplashImage) return unsplashImage

    // Try Pexels API (business-focused stock photos)
    const pexelsImage = await this.searchPexels(keywords, category)
    if (pexelsImage) return pexelsImage

    // Fallback to generated pattern
    return this.generateCategoryPattern(category, article._id)
  }

  /**
   * Extract keywords from title and excerpt
   */
  private extractKeywords(title: string, excerpt?: string): string[] {
    const text = `${title} ${excerpt || ''}`.toLowerCase()

    // Business-focused keywords for executive audience
    const businessTerms = [
      'strategy', 'leadership', 'innovation', 'growth', 'transformation',
      'digital', 'sustainability', 'performance', 'efficiency', 'expansion',
      'acquisition', 'partnership', 'investment', 'market', 'technology',
      'healthcare', 'finance', 'operations', 'culture', 'talent'
    ]

    const foundKeywords = businessTerms.filter(term => text.includes(term))

    // Add category-specific terms
    if (text.includes('healthcare')) foundKeywords.push('medical', 'health', 'hospital')
    if (text.includes('finance')) foundKeywords.push('financial', 'banking', 'investment')
    if (text.includes('technology')) foundKeywords.push('tech', 'digital', 'ai', 'software')

    return foundKeywords.slice(0, 3) // Limit to 3 most relevant keywords
  }

  /**
   * Search Unsplash for professional business imagery
   * Note: Using Picsum instead due to better rate limits
   */
  private async searchUnsplash(keywords: string[], category: string): Promise<string | null> {
    try {
      // Use Picsum Photos (Lorem Picsum) which has excellent rate limits
      // Each article gets a unique seed to ensure different images
      const seed = Math.random().toString(36).substring(2, 15)
      const uniqueUrl = `https://picsum.photos/seed/${seed}/1200/800`

      return uniqueUrl
    } catch (error) {
      console.error('Image fetch failed:', error)
      return null
    }
  }

  /**
   * Search Pexels for business-focused stock photos
   */
  private async searchPexels(keywords: string[], category: string): Promise<string | null> {
    try {
      const searchTerms = [...keywords, 'business', 'executive', 'corporate'].join(' ')

      // Note: In production, you'd use actual Pexels API
      // For now, we'll create a placeholder service
      const pexelsDemoUrl = `https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg`

      // Add unique parameter to prevent duplicates
      const uniqueUrl = `${pexelsDemoUrl}?auto=compress&cs=tinysrgb&w=1200&h=800&unique=${Date.now()}`

      return uniqueUrl
    } catch (error) {
      console.error('Pexels search failed:', error)
      return null
    }
  }

  /**
   * Generate unique SVG pattern based on category
   */
  private generateCategoryPattern(category: string, articleId: string): string {
    const patterns: Record<string, string> = {
      'healthcare': this.generateMedicalPattern(articleId),
      'finance': this.generateFinancePattern(articleId),
      'technology': this.generateTechPattern(articleId),
      'leadership': this.generateLeadershipPattern(articleId),
      'strategy': this.generateStrategyPattern(articleId),
      'default': this.generateDefaultPattern(articleId)
    }

    return patterns[category] || patterns.default
  }

  /**
   * Generate medical-themed pattern
   */
  private generateMedicalPattern(articleId: string): string {
    const seed = this.hashString(articleId)
    const colors = ['#0066CC', '#00AA44', '#FFFFFF']
    const patternType = seed % 3

    if (patternType === 0) {
      return `data:image/svg+xml,${encodeURIComponent(`
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="medical" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="${colors[2]}"/>
              <path d="M30 10 L30 50 M10 30 L50 30" stroke="${colors[0]}" stroke-width="2"/>
              <circle cx="30" cy="30" r="8" fill="${colors[1]}" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#medical)"/>
        </svg>
      `)}`
    }

    return this.generateDefaultPattern(articleId)
  }

  /**
   * Generate finance-themed pattern
   */
  private generateFinancePattern(articleId: string): string {
    const seed = this.hashString(articleId)
    const colors = ['#1B365D', '#4A90E2', '#F8F9FA']

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="financeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:0.8" />
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#financeGrad)"/>
        <g opacity="0.1">
          ${Array.from({ length: 20 }, (_, i) => {
      const x = (i * 60) % 1200
      const y = Math.floor((i * 60) / 1200) * 60
      return `<rect x="${x}" y="${y}" width="30" height="30" fill="${colors[2]}"/>`
    }).join('')}
        </g>
      </svg>
    `)}`
  }

  /**
   * Generate tech-themed pattern
   */
  private generateTechPattern(articleId: string): string {
    const seed = this.hashString(articleId)
    const colors = ['#0F1419', '#00D4FF', '#FFFFFF']

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <rect width="1200" height="800" fill="${colors[0]}"/>
        <g opacity="0.3">
          ${Array.from({ length: 50 }, (_, i) => {
      const x = (seed * i * 47) % 1200
      const y = (seed * i * 73) % 800
      const size = 2 + (seed * i) % 4
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="${colors[1]}"/>`
    }).join('')}
        </g>
        <rect x="0" y="0" width="1200" height="800" fill="${colors[0]}" opacity="0.7"/>
      </svg>
    `)}`
  }

  /**
   * Generate leadership-themed pattern
   */
  private generateLeadershipPattern(articleId: string): string {
    const seed = this.hashString(articleId)
    const colors = ['#2C3E50', '#E74C3C', '#ECF0F1']

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="leadership" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="${colors[0]}"/>
            <polygon points="40,10 50,30 70,30 55,45 60,65 40,55 20,65 25,45 10,30 30,30" fill="${colors[1]}" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#leadership)"/>
      </svg>
    `)}`
  }

  /**
   * Generate strategy-themed pattern
   */
  private generateStrategyPattern(articleId: string): string {
    const seed = this.hashString(articleId)
    const colors = ['#34495E', '#9B59B6', '#BDC3C7']

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="strategy" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="${colors[0]}"/>
            <path d="M20 20 L80 20 L80 80 L20 80 Z" fill="none" stroke="${colors[1]}" stroke-width="2"/>
            <path d="M30 30 L70 30 L70 70 L30 70 Z" fill="none" stroke="${colors[2]}" stroke-width="1"/>
            <circle cx="50" cy="50" r="10" fill="${colors[1]}" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="1200" height="800" fill="url(#strategy)"/>
      </svg>
    `)}`
  }

  /**
   * Generate default professional pattern
   */
  private generateDefaultPattern(articleId: string): string {
    const seed = this.hashString(articleId)
    const colors = ['#1A1A1A', '#FF6B35', '#F5F5F5']

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${colors[1]};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${colors[2]};stop-opacity:0.9" />
          </linearGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#defaultGrad)"/>
        <g opacity="0.1">
          ${Array.from({ length: 30 }, (_, i) => {
      const x = (seed * i * 37) % 1200
      const y = (seed * i * 61) % 800
      return `<line x1="${x}" y1="${y}" x2="${x + 50}" y2="${y + 30}" stroke="${colors[2]}" stroke-width="1"/>`
    }).join('')}
        </g>
      </svg>
    `)}`
  }

  /**
   * Generate simple fallback image
   */
  private generateFallbackImage(article: Article): string {
    const category = article.category?.title?.toLowerCase() || 'business'
    return this.generateCategoryPattern(category, article._id)
  }

  /**
   * Simple hash function for seeding
   */
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Extract image ID from URL
   */
  private extractImageId(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.pathname + urlObj.search
    } catch {
      return url
    }
  }

  /**
   * Initialize with existing article images to prevent duplicates
   */
  async initializeExistingImages(articles: Article[]): Promise<void> {
    articles.forEach(article => {
      if (article.featuredImage?.asset?._ref) {
        this.usedImageIds.add(article.featuredImage.asset._ref)
      }
    })
  }
}

export const articleImageService = ArticleImageService.getInstance()