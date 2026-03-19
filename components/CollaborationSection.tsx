'use client'

import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'

interface CollaborationSectionProps {
  value: {
    preTitle?: string
    title?: string
    description?: string
    linkText?: string
    linkUrl?: string
    image?: any // RALPH-BYPASS [Legacy]
    quoteText?: string
    quoteAuthor?: string
    quoteRole?: string
  }
}

export default function CollaborationSection({ value }: CollaborationSectionProps) {
  const { preTitle, title, description, linkText, linkUrl, image, quoteText, quoteAuthor, quoteRole } = value

  return (
    <div className="my-12">
      {/* Top Divider */}
      <hr className="border-t border-gray-200 mb-8" />

      {/* Main Card */}
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <div className="flex-1">
          {preTitle && (
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">
              {preTitle}
            </p>
          )}
          {title && (
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-lg text-gray-600 leading-relaxed mb-6 italic">
              {description}
            </p>
          )}
          {linkUrl && (
            <Link 
              href={linkUrl} 
              className="text-lg font-bold text-gray-900 hover:text-[#c8ab3d] transition-colors"
            >
              {linkText || 'Read More'}
            </Link>
          )}
        </div>

        {image && (
          <div className="w-full md:w-1/3 aspect-square relative rounded-lg overflow-hidden shadow-sm">
            <OptimizedImage
              src={urlFor(image).width(400).height(400).url()}
              alt={title || ''}
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Bottom Divider */}
      <hr className="border-t border-gray-200 mt-8 mb-12" />

      {/* Quote Section */}
      {quoteText && (
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-lg md:text-xl text-gray-500 italic leading-relaxed mb-6 font-serif">
            "{quoteText}"
          </p>
          {(quoteAuthor || quoteRole) && (
            <p className="text-sm text-gray-500 font-medium">
              — {quoteAuthor}{quoteRole ? `, ${quoteRole}` : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
