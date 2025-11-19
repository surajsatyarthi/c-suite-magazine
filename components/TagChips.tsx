// Search is removed: chips are informational only (no links)

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

type TagChipsProps = {
  tags: string[]
  className?: string
  size?: 'sm' | 'md'
  variant?: 'blue' | 'gold'
}

export default function TagChips({ tags, className, size = 'sm', variant = 'blue' }: TagChipsProps) {
  if (!Array.isArray(tags) || tags.length === 0) return null

  // Normalize tag labels for display: strip leading '#', Title Case, handle acronyms
  const ACRONYMS = new Set(['AI', 'ESG', 'CFO', 'CEO', 'BFSI', 'IT'])
  const EDITORIAL_OVERRIDES: Record<string, string> = {
    // Category-style tags to editorial labels
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
  const normalizeDisplayTag = (raw: string) => {
    const base = String(raw || '')
      .replace(/^#/, '')
      .replace(/[-_]/g, ' ')
      .trim()
    if (!base) return ''
    const display = base
      .split(/\s+/)
      .map((w) => {
        const upper = w.toUpperCase()
        if (ACRONYMS.has(upper)) return upper
        if (upper === 'CXO') return 'CxO'
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      })
      .join(' ')
    const overrideKey = display.toLowerCase()
    return EDITORIAL_OVERRIDES[overrideKey] || display
  }

  const colorClasses = variant === 'gold'
    ? 'text-[#3f330d] bg-[#c8ab3d]/15 border-[#c8ab3d]/30 hover:bg-[#c8ab3d]/25'
    : 'text-[#082945] bg-[#082945]/10 border-[#082945]/20 hover:bg-[#082945]/20'

  const baseChip = cx(
    'rounded-full border transition-colors',
    colorClasses,
    size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-base'
  )

  return (
    <div className={cx('flex flex-wrap gap-2', className)} aria-label="Article tags">
      {tags.map((tag, index) => {
        const display = normalizeDisplayTag(tag)
        const chip = <span className={baseChip}>#{display}</span>
        return <span key={`${tag}-${index}`}>{chip}</span>
      })}
    </div>
  )
}
