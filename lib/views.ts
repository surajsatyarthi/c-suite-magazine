import viewsMap from '@/config/views.json'

export function getViews(slug?: string, fallback?: number | null): number | null {
  if (!slug) return typeof fallback === 'number' ? fallback : null
  const key = String(slug).trim().toLowerCase()
  const local = (viewsMap as Record<string, number>)[key]
  if (typeof local === 'number' && local > 0) return local
  return typeof fallback === 'number' && fallback > 0 ? fallback : null
}

/**
 * Format view counts in millions.
 * • Always shows minimum of "5M+" for all articles
 * • If count >= 5,000,000 → "5M+"
 * • If count < 5,000,000 → "5M+"
 */
export function formatViewsMillion(n?: number | null): string {
  // Always show 5M+ minimum
  return '5M+'
}
