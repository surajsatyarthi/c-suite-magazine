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
 * • If count >= 5,000,000 → "5M+"
 * • If no views available → "5M+" (default)
 * • Otherwise show one decimal place followed by " M"
 */
export function formatViewsMillion(n?: number | null): string {
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) return '5M+'
  if (n >= 5000000) return '5M+'
  return `${(n / 1000000).toFixed(1)} M`
}
