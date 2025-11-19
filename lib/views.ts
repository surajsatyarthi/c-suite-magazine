import viewsMap from '@/config/views.json'

export function getViews(slug?: string, fallback?: number | null): number | null {
  if (!slug) return typeof fallback === 'number' ? fallback : null
  const key = String(slug).trim().toLowerCase()
  const local = (viewsMap as Record<string, number>)[key]
  if (typeof local === 'number' && local > 0) return local
  return typeof fallback === 'number' && fallback > 0 ? fallback : null
}

export function formatViewsMillion(n?: number | null): string | null {
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) return null
  return `${(n / 1_000_000).toFixed(1)}M`
}
