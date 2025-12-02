'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { useAdTrigger } from '@/hooks/useAdTrigger'

interface InArticleAdProps {
    image: string
    href: string
    title?: string
    width?: number
    height?: number
    className?: string
    disablePopup?: boolean
}

export default function InArticleAd({ image, href, title, width = 728, height = 90, className, disablePopup = false }: InArticleAdProps) {
    const { triggerAd } = useAdTrigger()
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (disablePopup) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Trigger popup when ad is 50% visible
                        triggerAd({
                            image,
                            href,
                            title: title || 'Sponsored'
                        })
                    }
                })
            },
            {
                threshold: 0.5, // Trigger when 50% visible
                rootMargin: '0px'
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => observer.disconnect()
    }, [image, href, title, triggerAd, disablePopup])

    return (
        <div ref={ref} className={className}>
            <Link href={href} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
                <div
                    className="relative w-full mx-auto"
                    style={{ aspectRatio: `${width}/${height}`, maxWidth: `${width}px` }}
                >
                    <OptimizedImage
                        src={image}
                        alt={title || 'Sponsored'}
                        fill
                        className="rounded object-contain"
                        sizes="(max-width: 1024px) 100vw, 728px"
                        priority={false} // Lazy load in-article ads
                    />
                </div>
            </Link>
        </div>
    )
}
