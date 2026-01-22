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
  
  // 1. INTENTIONAL: If real data (from CMS) is >= 5M, show the badge.
  if (realViews >= 5000000) return '5M+'
  
  // 2. JITTER: Generate pseudo-random count between 2.1M - 4.8M based on slug.
  // We strictly clamp at 4.8M to reserve "5M+" for true viral content.
  if (slug) {
    const hash = hashCode(slug)
    const random = (hash % 101) / 100 // Generates 0.0 - 1.0
    
    // Range: 2.1M + (0 to 2.7M) = Max 4.8M
    const jitter = 2.1 + (random * 2.7)
    
    // Convert realViews to million scale (e.g., 1000 views = 0.001M)
    // Even with jitter, we ensure it doesn't accidentally cross 4.9M
    const totalMillion = Math.min(jitter + (realViews / 1000000), 4.8)
    
    return `${totalMillion.toFixed(1)} M`
  }
  
  // 3. FALLBACK: Default to baseline if no slug provided (was '5M+', now safer '2.1 M')
  return '2.1 M'
}
