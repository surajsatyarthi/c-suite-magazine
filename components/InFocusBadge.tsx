'use client'

interface InFocusBadgeProps {
  articleType: 'csa' | 'interview' | 'juggernaut' | 'spotlight' | null
}

export default function InFocusBadge({ articleType }: InFocusBadgeProps) {
  if (!articleType) return null

  const badgeConfig = {
    csa: { label: 'SPECIAL FEATURE', color: '#c8ab3d' }, // Gold
    interview: { label: 'IN FOCUS', color: '#003366' }, // Blue
    juggernaut: { label: 'JUGGERNAUT', color: '#082945' }, // Navy
    spotlight: { label: 'SPOTLIGHT', color: '#c8ab3d' }, // Gold
  }

  const config = badgeConfig[articleType]

  return (
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
      style={{
        writingMode: 'vertical-lr',
        transform: 'translateY(-50%) rotate(180deg)',
      }}
    >
      <div
        className="px-4 py-6 text-white font-bold text-sm tracking-[3px] uppercase"
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </div>
    </div>
  )
}
