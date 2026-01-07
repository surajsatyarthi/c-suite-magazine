'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { useAdTrigger } from '@/hooks/useAdTrigger'
import { trackAdImpression, trackAdClick } from '@/lib/analytics'

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
    // CSA sponsors paid for popup ad - show EVERY visit (no cooldown)
    const { triggerAd } = useAdTrigger(true) // skipSessionCheck = true
    const ref = useRef<HTMLDivElement>(null)
    const hasTrackedImpression = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Track impression only once per ad view
                        if (!hasTrackedImpression.current) {
                            trackAdImpression({
                                ad_name: title || 'In-Article Ad',
                                ad_placement: 'in-article',
                                ad_url: href,
                            })
                            hasTrackedImpression.current = true
                        }

                        // Trigger popup when ad is 50% visible (if not disabled)
                        if (!disablePopup) {
                            triggerAd({
                                image,
                                href,
                                title: title || 'Sponsored'
                            })
                        }
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

    const handleClick = () => {
        trackAdClick({
            ad_name: title || 'In-Article Ad',
            ad_placement: 'in-article',
            ad_url: href,
        })
    }

    return (
        <div ref={ref} className={className}>
            <Link href={href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
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
