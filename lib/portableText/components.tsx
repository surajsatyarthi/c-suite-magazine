/**
 * Portable Text component configuration
 * Rendering logic for all block types, marks, and custom elements
 */

import { PortableTextComponents } from '@portabletext/react'
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'
import { slugify, extractTextFromChildren } from './textUtils'

export const portableTextComponents: PortableTextComponents = {
    types: {
        image: ({ value }) => {
            if (!value?.asset) return null
            const src = urlFor(value).width(1200).height(800).auto('format').url()
            const alt = value?.alt || 'Image'
            return (
                <div className="relative w-full h-[400px] md:h-[500px] my-8 rounded-lg overflow-hidden">
                    <OptimizedImage
                        src={src}
                        alt={alt}
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                </div>
            )
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
            <blockquote className="border-l-4 border-[#c8ab3d] pl-6 my-8 italic text-xl text-gray-600">
                {children}
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
