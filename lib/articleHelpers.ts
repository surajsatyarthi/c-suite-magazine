import 'server-only'
import { Post } from '@/lib/types'

/**
 * Extracts or generates a hero tagline for article overlay
 * Priority: manual override > type-based > category-based > fallback
 */
export function getHeroTagline(article: Post): string | null {
  // Priority 1: Manual override (if field exists)
  if ((article as any).heroTagline) {
    return truncateTagline((article as any).heroTagline)
  }

  // Priority 2: Check if CSA type
  if ((article as any)._type === 'csa') {
    // Try to extract industry/company from title
    const industryMatch = article.title.match(/India'?s?\s+(\w+\s+\w+)/i)
    if (industryMatch) {
      return truncateTagline(`INDIA'S ${industryMatch[1].toUpperCase()}`)
    }
    return 'EXECUTIVE INSIGHTS'
  }

  // Priority 3: Category-based defaults
  const categorySlug = article.categories?.[0]?.slug?.current
  const categoryTaglines: Record<string, string> = {
    'cxo-interview': 'EXECUTIVE INSIGHTS',
    'cxo-spotlight': 'LEADER SPOTLIGHT',
    'company-sponsored': 'INDUSTRY LEADER',
  }

  if (categorySlug && categoryTaglines[categorySlug]) {
    return categoryTaglines[categorySlug]
  }

  // Priority 4: Tag-based
  if (Array.isArray(article.tags) && article.tags.includes('Industry Juggernaut')) {
    return 'INDUSTRY JUGGERNAUT'
  }

  // Priority 5: Generic fallback from category title
  if (article.categories?.[0]?.title) {
    return truncateTagline(article.categories[0].title.toUpperCase())
  }

  // Default fallback
  return 'FEATURED'
}

/**
 * Truncates tagline to max 40 characters at word boundary
 */
function truncateTagline(text: string): string {
  if (text.length <= 40) return text

  // Find last space before 40 chars
  const truncated = text.substring(0, 40)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > 20) {
    // Only truncate at word boundary if it's not too early
    return truncated.substring(0, lastSpace)
  }

  return truncated
}

/**
 * Determines article type for badge variant
 */
export function getArticleType(article: Post): 'csa' | 'interview' | 'juggernaut' | 'spotlight' | null {
  // Check tags first
  if (Array.isArray(article.tags) && article.tags.includes('Industry Juggernaut')) {
    return 'juggernaut'
  }

  // Check categories
  const categorySlug = article.categories?.[0]?.slug?.current

  if ((article as any)._type === 'csa') {
    return 'csa'
  }

  if (categorySlug === 'cxo-interview') {
    return 'interview'
  }

  if (categorySlug === 'cxo-spotlight') {
    return 'spotlight'
  }

  // Standard articles don't get badge
  return null
}
