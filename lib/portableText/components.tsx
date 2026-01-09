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
import PartnerQuotes from '@/components/PartnerQuotes'
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
        partnerQuotes: ({ value }) => {
            const quotes = (value as any)?.quotes || []
            return <PartnerQuotes quotes={quotes} />
        },
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
                            targetUrl={targetUrl}
                            caption={caption || alt}
                        />
                    </div>
                )
            }

            return (
                <figure className="my-8">
                    <div className="relative w-full h-auto overflow-hidden rounded-lg">
                        <OptimizedImage src={src} alt={alt} width={1200} height={675} className="w-full h-auto" />
                    </div>
                    {caption && (
                        <figcaption className="mt-2 text-sm text-gray-600 text-center italic">
                            {caption}
                        </figcaption>
                    )}
                </figure>
            )
        },
    },

    marks: {
        strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        link: ({ value, children }) => {
            const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
            return (
                <a
                    href={value?.href}
                    target={target}
                    rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                    className="text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                    {children}
                </a>
            )
        },
    },

    block: {
        h1: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugify(text)
            return (
                <h1 id={id} className="scroll-mt-20 text-4xl font-bold text-gray-900 mb-6 mt-10">
                    {children}
                </h1>
            )
        },

        h2: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugify(text)
            return (
                <div className="my-12">
                    <h2 id={id} className="scroll-mt-20 text-center text-3xl font-bold text-gray-900 mb-4">
                        {children}
                    </h2>
                    <div className="flex justify-center">
                        <div className="w-24 h-0.5 bg-[#c8ab3d]"></div>
                    </div>
                </div>
            )
        },

        h3: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugify(text)
            return (
                <h3 id={id} className="scroll-mt-20 text-2xl font-bold text-gray-900 mb-3 mt-8">
                    {children}
                </h3>
            )
        },

        h4: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugify(text)
            return (
                <h4 id={id} className="scroll-mt-20 text-xl font-semibold text-gray-900 mb-2 mt-6">
                    {children}
                </h4>
            )
        },

        h5: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugify(text)
            return (
                <h5 id={id} className="scroll-mt-20 text-lg font-semibold text-gray-900 mb-2 mt-4">
                    {children}
                </h5>
            )
        },

        h6: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugify(text)
            return (
                <h6 id={id} className="scroll-mt-20 text-base font-semibold text-gray-900 mb-2 mt-4">
                    {children}
                </h6>
            )
        },

        normal: ({ children, value }) => {
            if (!children || (Array.isArray(children) && children.length === 0 && !(value as any)?.text)) {
                return null
            }

            const actualValue = value as any
            const isQ = actualValue?.__qa === 'Q'
            const isA = actualValue?.__qa === 'A'

            if (isQ) {
                const text = extractTextFromChildren(children)
                const id = slugify(text)
                return (
                    <p id={id} className="font-bold mt-8 mb-2 text-gray-900 text-lg scroll-mt-20">
                        {children}
                    </p>
                )
            }

           if (isA) {
                return (
                    <p className="text-gray-700 leading-relaxed mb-4 italic pl-4 border-l-2 border-gray-300">
                        {children}
                    </p>
                )
            }

            return (
                <p className="text-gray-700 leading-relaxed mb-4">
                    {children}
                </p>
            )
        },

        blockquote: ({ children }) => (
            <div className="my-16 px-4 md:px-16">
                <blockquote className="relative border-none">
                    {/* Decorative quote mark */}
                    <div className="absolute -top-6 left-0 text-8xl text-[#c8ab3d]/20 font-serif leading-none">"</div>
                    
                    {/* Quote content */}
                    <div className="relative bg-gradient-to-br from-[#082945]/5 to-[#082945]/10 border-l-4 border-[#c8ab3d] rounded-r-lg p-8 md:p-12">
                        <p className="text-[#082945] font-serif italic text-2xl md:text-3xl leading-relaxed text-center">
                            {children}
                        </p>
                    </div>
                    
                    {/* Bottom decorative line */}
                    <div className="mt-6 flex justify-center">
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#c8ab3d] to-transparent"></div>
                    </div>
                </blockquote>
            </div>
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
