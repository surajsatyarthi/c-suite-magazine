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

/**
 * Calculates the raw numeric view count including Jitter.
 * Returns a number (e.g., 2500000).
 */
export function getViewCountValue(realViews?: number | null, slug?: string): number {
  const real = typeof realViews === 'number' && isFinite(realViews) ? realViews : 0
  
  // 1. If real data is massive, return it directly
  if (real >= 5000000) return real

  // 2. Jitter Logic (Must match formatViewsMillion)
  if (slug) {
    const hash = hashCode(slug)
    const random = (hash % 101) / 100 // 0.0 - 1.0
    const jitterMillion = 2.1 + (random * 2.7) // Range 2.1M - 4.8M
    
    // Combine Jitter + Real (scaled to millions)
    const totalMillion = Math.min(jitterMillion + (real / 1000000), 4.8)
    
    return Math.round(totalMillion * 1000000)
  }

  // 3. Fallback baseline
  return 2100000
}

export function formatViewsMillion(n?: number | null, slug?: string): string {
  const val = getViewCountValue(n, slug)
  
  if (val >= 5000000) return '5M+'
  
  const millions = val / 1000000
  return `${millions.toFixed(1)} M`
}
