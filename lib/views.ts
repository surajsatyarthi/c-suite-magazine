export function getViews(slug?: string, fallback?: number | null): number | null {
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
 * • BASELINE: Uses slug-based jitter for social proof (2.1M+)
 * • GROWTH: Adds real viewership data (n) to the baseline
 * • Values >= 5.0M show as "5M+"
 */
export function formatViewsMillion(n?: number | null, slug?: string): string {
  const realViews = typeof n === 'number' && isFinite(n) ? n : 0
  
  // If we have real high view count (>5M), show 5M+
  if (realViews >= 5000000) return '5M+'
  
  // Generate pseudo-random count between 2.1M - 5M+ based on slug
  if (slug) {
    const hash = hashCode(slug)
    const random = (hash % 101) / 100 // Generates 0.0 - 1.0
    // Range 2.1 to 5.3 (any >= 5.0 becomes 5M+)
    const jitter = 2.1 + (random * 3.2)
    
    // Convert realViews to million scale (e.g., 1000 views = 0.001M)
    const totalMillion = jitter + (realViews / 1000000)
    
    return totalMillion >= 5.0 ? '5M+' : `${totalMillion.toFixed(1)} M`
  }
  
  // Default fallback
  return '5M+'
}
