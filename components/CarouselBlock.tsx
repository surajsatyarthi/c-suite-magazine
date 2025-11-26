'use client'

import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'

interface CarouselBlockProps {
    value: {
        images: {
            _key: string
            asset: any
            alt?: string
            caption?: string
        }[]
    }
}

export default function CarouselBlock({ value }: CarouselBlockProps) {
    const { images } = value
    if (!images || images.length === 0) return null

    return (
        <div className="my-12 w-full">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                {images.map((image) => {
                    const src = urlFor(image).width(800).height(600).auto('format').url()
                    return (
                        <div key={image._key} className="snap-center shrink-0 w-[85%] md:w-[60%] first:pl-0 last:pr-0">
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                                <OptimizedImage
                                    src={src}
                                    alt={image.alt || 'Carousel image'}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 85vw, 60vw"
                                />
                            </div>
                            {image.caption && (
                                <p className="mt-2 text-sm text-gray-500 italic font-serif text-center">
                                    {image.caption}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
