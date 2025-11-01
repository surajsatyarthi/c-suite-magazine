import { PortableText, PortableTextComponents } from '@portabletext/react'
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'
import Ad from '@/components/Ad'

type PortableBodyProps = {
  value: any[] | undefined
}

function slugify(text: string): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractTextFromChildren(children: any[]): string {
  try {
    return (children || [])
      .map((c: any) => String(c?.text || ''))
      .join(' ')
      .trim()
  } catch {
    return ''
  }
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null
      const src = urlFor(value).width(1200).height(800).url()
      const alt = value?.alt || 'Image'
      return (
        <div className="relative w-full h-[400px] md:h-[500px] my-8 rounded-lg overflow-hidden">
          <OptimizedImage src={src} alt={alt} fill className="object-cover" sizes="100vw" />
        </div>
      )
    },
  },
  block: {
    h1: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      return <h1 id={id} className="text-4xl md:text-5xl font-serif font-normal text-gray-900 mb-6">{children}</h1>
    },
    h2: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      return <h2 id={id} className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">{children}</h2>
    },
    h3: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      return <h3 id={id} className="text-2xl font-serif font-normal text-gray-900 mt-8 mb-4">{children}</h3>
    },
    h4: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      return <h4 id={id} className="text-xl font-serif font-normal text-gray-900 mt-6 mb-3">{children}</h4>
    },
    normal: ({ children }) => <p className="text-gray-700 leading-relaxed">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#c8ab3d] pl-6 my-8 italic text-xl text-gray-600">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside space-y-2 text-gray-700">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside space-y-2 text-gray-700">{children}</ol>,
  },
}

export default function PortableBody({ value }: PortableBodyProps) {
  if (!value || value.length === 0) return null
  const blockCount = value.length
  const minBlocksForMidAd = 6

  if (blockCount < minBlocksForMidAd) {
    // Short article: render full content and only end ad
    return (
      <div className="prose prose-lg max-w-3xl mx-auto">
        <PortableText value={value} components={components} />
        <div className="my-12 bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
          <Ad placement="in-article" />
        </div>
      </div>
    )
  }

  // Long article: insert a middle ad and an end ad
  const midIndex = Math.floor(blockCount / 2)
  const firstHalf = value.slice(0, midIndex)
  const secondHalf = value.slice(midIndex)

  return (
    <div className="prose prose-lg max-w-3xl mx-auto">
      <PortableText value={firstHalf} components={components} />
      <div className="my-12 bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
        <Ad placement="in-article" />
      </div>
      <PortableText value={secondHalf} components={components} />
      <div className="my-12 bg-gray-50 border-2 border-gray-200 rounded-lg p-8">
        <Ad placement="in-article" />
      </div>
    </div>
  )
}
