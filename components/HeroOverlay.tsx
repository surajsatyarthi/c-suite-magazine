'use client'

interface HeroOverlayProps {
  tagline: string | null
  show?: boolean
}

export default function HeroOverlay({ tagline, show = true}: HeroOverlayProps) {
  if (!show || !tagline) return null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      <div
        className="w-full py-6 px-4 text-center"
        style={{
          background: 'linear-gradient(to top, rgba(0, 51, 102, 0.85) 0%, rgba(0, 51, 102, 0.7) 50%, transparent 100%)',
        }}
      >
        <div className="inline-block bg-white/95 backdrop-blur-sm px-8 py-3 rounded-sm shadow-lg">
          <h2 className="text-[#082945] font-bold text-lg md:text-2xl uppercase tracking-[2px] md:tracking-[3px]">
            {tagline}
          </h2>
        </div>
      </div>
    </div>
  )
}
