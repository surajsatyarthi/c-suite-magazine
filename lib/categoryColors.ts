export const CATEGORY_COLORS: Record<string, string> = {
  'automotive-logistics': '#475569',
  'business': '#c8ab3d',
  'cover-story': '#082945',
  'changemakers': '#14b8a6',
  'construction-mining': '#78716c',
  'cxo-interview': '#c8ab3d',
  'education': '#6366f1',
  'engineering': '#64748b',
  'entrepreneurs': '#c8ab3d',
  'events': '#b39935',
  'healthcare': '#dc2626',
  'it-telco': '#3b82f6',
  'innovation': '#2563eb',
  'leadership': '#082945',
  'manufacturing': '#475569',
  'money-finance': '#c8ab3d',
  'not-for-profit': '#10b981',
  'opinion': '#082945',
  'professional-services': '#082945',
  'property-real-estate': '#0891b2',
  'public-sector': '#0f172a',
  'retail': '#ef4444',
  'science-technology': '#0ea5e9',
  'startups': '#f59e0b',
  'sustainability': '#22c55e',
}

export function getCategoryColor(category: { slug?: { current?: string }, color?: string } | undefined): string {
  const slug = category?.slug?.current
  return category?.color || (slug ? CATEGORY_COLORS[slug] : undefined) || '#c8ab3d'
}
