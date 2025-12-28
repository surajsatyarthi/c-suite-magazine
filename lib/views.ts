import viewsMap from '@/config/views.json'

export function getViews(slug?: string, fallback?: number | null): number | null {
  if (!slug) return typeof fallback === 'number' ? fallback : null
  const key = String(slug).trim().toLowerCase()
  const local = (viewsMap as Record<string, number>)[key]
  if (typeof local === 'number' && local > 0) return local
  return typeof fallback === 'number' && fallback > 0 ? fallback : null
}

/**
 * Simple hash function to generate pseudo-random number from string
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Format view counts in millions.
 * • Shows random counts between 4.0M - 5.0M+ for visual variety
 * • Uses slug as seed for consistency (same article = same count)
 * • Actual high view counts (>5M) still show as "5M+"
 */
export function formatViewsMillion(n?: number | null, slug?: string): string {
  // If we have real high view count (>5M), show 5M+
  if (typeof n === 'number' && isFinite(n) && n >= 5000000) return '5M+'
  
  // Generate pseudo-random count between 4.0M - 5.0M based on slug
  if (slug) {
    const hash = hashCode(slug)
    const random = (hash % 11) / 10 // Generates 0.0 - 1.0
    const viewCount = 4.0 + random // 4.0M - 5.0M
    return viewCount >= 5.0 ? '5M+' : `${viewCount.toFixed(1)} M`
  }
  
  // Default fallback
  return '5M+'
}
