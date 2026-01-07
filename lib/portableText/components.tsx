/**
 * Portable Text component configuration
 * Rendering logic for all block types, marks, and custom elements
 */

import { PortableTextComponents } from '@portabletext/react'
import VideoPlayer from '@/components/VideoPlayer'
import TableBlock from '@/components/TableBlock'
import CarouselBlock from '@/components/CarouselBlock'
import CtaBlock from '@/components/CtaBlock'
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'
import { slugify, extractTextFromChildren } from './textUtils'

import InArticleAd from '@/components/InArticleAd'

export const portableTextComponents: PortableTextComponents = {
    types: {

        video: ({ value }) => {
            const { url, caption } = value as any
            return <VideoPlayer url={url} caption={caption} />
        },
        table: TableBlock,
        carousel: CarouselBlock,
        cta: CtaBlock,
        image: ({ value }) => {
            let src: string | undefined
            const asset: any = (value as any)?.asset
            if (asset && typeof asset.url === 'string') {
                src = asset.url
            } else if (typeof (value as any)?.url === 'string') {
                src = (value as any).url
            } else if ((value as any)?.asset) {
                src = urlFor(value).width(1200).fit('max').auto('format').url()
            } else if (typeof value === 'string') {
                const s = String(value).trim()
                if (s) src = s
            }
            if (!src) return null
            const alt = (value as any)?.alt || 'Image'
            const targetUrl = (value as any)?.targetUrl
            const caption = (value as any)?.caption
            const isPopupTrigger = (value as any)?.isPopupTrigger

            if (isPopupTrigger) {
                return (
                    <div className="my-8">
                        <InArticleAd
                            image={src}
                            href={targetUrl || '#'}
                            title={alt}
                            width={800}
                            height={500}
                            className="w-full h-auto rounded-lg object-contain"
                        />
                        {caption && (
                            <div className="mt-2 text-sm text-gray-500 text-center italic font-serif">
                                {caption}
                            </div>
                        )}
                    </div>
                )
            }

            const img = (
                <div className="relative w-full my-8">
                    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                        <OptimizedImage
                            src={src}
                            alt={alt}
                            fill
                            className="object-contain"
                            sizes="100vw"
                        />
                    </div>
                    {caption && (
                        <div className="mt-2 text-sm text-gray-500 text-center italic font-serif">
                            {caption}
                        </div>
                    )}
                </div>
            )

            if (targetUrl) {
                return (
                    <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="block transition-opacity hover:opacity-90">
                        {img}
                    </a>
                )
            }

            return img
        },
    },

    marks: {
        underline: ({ children }) => <span className="underline">{children}</span>,
    },

    block: {
        h1: ({ children, value }: any) => {
            const text = extractTextFromChildren(value?.children || [])
            const id = slugify(text)
            // Downlevel in-body h1 to visual h2 to avoid heading overuse
            return (
                <h2 id={id} className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">
                    {children}
                </h2>
            )
        },

        h2: ({ children, value }: any) => {
            const text = extractTextFromChildren(value?.children || [])
            const id = slugify(text)
            return (
                <h2 id={id} className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">
                    {children}
                </h2>
            )
        },

        h3: ({ children, value }: any) => {
            const text = extractTextFromChildren(value?.children || [])
            const id = slugify(text)
            const isQ = (value as any)?.__qa === 'Q'
            return (
                <h3
                    id={id}
                    className={(isQ ? '!font-bold ' : '') + 'text-2xl font-serif font-normal text-gray-900 mt-8 mb-4'}
                >
                    {children}
                </h3>
            )
        },

        h4: ({ children, value }: any) => {
            const text = extractTextFromChildren(value?.children || [])
            const id = slugify(text)
            const isQ = (value as any)?.__qa === 'Q'
            return (
                <h4
                    id={id}
                    className={(isQ ? '!font-bold ' : '') + 'text-xl font-serif font-normal text-gray-900 mt-6 mb-3'}
                >
                    {children}
                </h4>
            )
        },

        h5: ({ children, value }: any) => {
            const text = extractTextFromChildren(value?.children || [])
            const id = slugify(text)
            const isQ = (value as any)?.__qa === 'Q'
            return (
                <h5
                    id={id}
                    className={(isQ ? '!font-bold ' : '') + 'text-lg font-serif font-normal text-gray-900 mt-5 mb-2'}
                >
                    {children}
                </h5>
            )
        },

        h6: ({ children, value }: any) => {
            const text = extractTextFromChildren(value?.children || [])
            const id = slugify(text)
            const isQ = (value as any)?.__qa === 'Q'
            return (
                <h6
                    id={id}
                    className={(isQ ? '!font-bold ' : '') + 'text-base font-serif font-normal text-gray-900 mt-4 mb-2'}
                >
                    {children}
                </h6>
            )
        },

        normal: ({ children, value }: any) => {
            const isQ = (value as any)?.__qa === 'Q'
            return (
                <p className={(isQ ? '!font-bold mt-6 mb-2 ' : '') + 'text-gray-700 leading-relaxed'}>
                    {children}
                </p>
            )
        },

        blockquote: ({ children }) => (
            <blockquote className="my-12 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-[#c8ab3d] opacity-20 font-serif">
                    &ldquo;
                </div>
                <div className="relative z-10 text-center px-8 md:px-16">
                    <p className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-relaxed">
                        {children}
                    </p>
                    <div className="mt-6 w-16 h-1 bg-[#c8ab3d] mx-auto opacity-60"></div>
                </div>
            </blockquote>
        ),
    },

    list: {
        bullet: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 text-gray-700">
                {children}
            </ul>
        ),
        number: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {children}
            </ol>
        ),
    },
}
