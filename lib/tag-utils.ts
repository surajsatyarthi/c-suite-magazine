/**
 * Tag Utilities for C-Suite Magazine
 * Ensures consistent slugification and display normalization for SEO and UI.
 */

const ACRONYMS = new Set(['AI', 'ESG', 'CFO', 'CEO', 'BFSI', 'IT', 'HR', 'PR', 'VC', 'IPO', 'SAAS', 'B2B', 'B2C'])

const EDITORIAL_OVERRIDES: Record<string, string> = {
  'money finance': 'Money & Finance',
  'science technology': 'Science & Technology',
  'it telco': 'IT & Telco',
  'automotive logistics': 'Automotive & Logistics',
  'property real estate': 'Property & Real Estate',
  'not for profit': 'Not-For-Profit',
  'public sector': 'Public Sector',
  'professional services': 'Professional Services',
  'ceo woman': 'CEO Woman',
  'cxo interview': 'CxO Interview',
}

/**
 * Convert a raw tag string to an SEO-friendly URL slug
 */
export function slugifyTag(tag: string): string {
  if (!tag) return ''
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric chars (except spaces/hyphens)
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
}

/**
 * Normalize a tag or slug for consistent display
 */
export function normalizeDisplayTag(raw: string): string {
  if (!raw) return ''
  
  // Strip leading '#' and handle slugs (replace hyphens with spaces)
  const base = raw
    .replace(/^#/, '')
    .replace(/-/g, ' ')
    .trim()

  if (!base) return ''

  const display = base
    .split(/\s+/)
    .map((w) => {
      const upper = w.toUpperCase()
      if (ACRONYMS.has(upper)) return upper
      if (upper === 'CXO') return 'CxO'
      if (upper === 'SAAS') return 'SaaS'
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    })
    .join(' ')

  const overrideKey = display.toLowerCase()
  return EDITORIAL_OVERRIDES[overrideKey] || display
}
