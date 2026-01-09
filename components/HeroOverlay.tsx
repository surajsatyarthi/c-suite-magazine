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
        className="w-full py-8 px-8 text-center"
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 40%, rgba(255, 255, 255, 0.4) 70%, transparent 100%)',
        }}
      >
        <h2 className="text-[#082945] font-serif text-xl md:text-3xl uppercase tracking-[3px] md:tracking-[5px] font-light">
          {tagline}
        </h2>
      </div>
    </div>
  )
}
