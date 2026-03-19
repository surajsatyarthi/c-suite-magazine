'use client'

import { useEffect, useRef } from 'react'
import OptimizedImage from '@/components/OptimizedImage'

interface PopupTriggerImageProps {
  src: string
  alt: string
}

/**
 * Wraps an inline ad image that has triggersPopup=true.
 * Fires 'csa-popup-trigger' custom event when this image enters the viewport.
 * CSAPopupTrigger listens for this event — keeping CSA popup logic fully separate
 * from the normal 50% scroll popup.
 */
export default function PopupTriggerImage({ src, alt }: PopupTriggerImageProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          window.dispatchEvent(new CustomEvent('csa-popup-trigger'))
          observer.disconnect()
        }
      },
      { threshold: 0.3 } // fire when 30% of the image is visible
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative w-full my-8">
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
        />
      </div>
    </div>
  )
}
