import { PortableText, type PortableTextComponents } from '@portabletext/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { urlFor } from '@/lib/sanity'
import Ad from '@/components/Ad'

type PortableBodyProps = {
  value: any | undefined
  ads?: boolean
  interviewMode?: boolean
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


import VideoPlayer from '@/components/VideoPlayer'
import TableBlock from '@/components/TableBlock'
import CarouselBlock from '@/components/CarouselBlock'
import CtaBlock from '@/components/CtaBlock'
import PartnerQuotes from '@/components/PartnerQuotes'

// ... imports

const components: PortableTextComponents = {
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

      const img = (
        <div className="relative w-full my-8">
          <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden">
            <OptimizedImage src={src} alt={alt} fill className="object-contain" sizes="100vw" />
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
      return <h2 id={id} className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">{children}</h2>
    },
    h2: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      return <h2 id={id} className="text-3xl font-serif font-normal text-gray-900 mt-12 mb-6">{children}</h2>
    },
    h3: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      const isQ = (value as any)?.__qa === 'Q'
      return <h3 id={id} className={(isQ ? '!font-bold ' : '') + 'text-2xl font-serif font-normal text-gray-900 mt-8 mb-4'}>{children}</h3>
    },
    h4: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      const isQ = (value as any)?.__qa === 'Q'
      return <h4 id={id} className={(isQ ? '!font-bold ' : '') + 'text-xl font-serif font-normal text-gray-900 mt-6 mb-3'}>{children}</h4>
    },
    h5: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      const isQ = (value as any)?.__qa === 'Q'
      return <h5 id={id} className={(isQ ? '!font-bold ' : '') + 'text-lg font-serif font-normal text-gray-900 mt-5 mb-2'}>{children}</h5>
    },
    h6: ({ children, value }: any) => {
      const text = extractTextFromChildren(value?.children || [])
      const id = slugify(text)
      const isQ = (value as any)?.__qa === 'Q'
      return <h6 id={id} className={(isQ ? '!font-bold ' : '') + 'text-base font-serif font-normal text-gray-900 mt-4 mb-2'}>{children}</h6>
    },
    normal: ({ children, value }: any) => {
      const isQ = (value as any)?.__qa === 'Q'
      const isFirstParagraph = (value as any)?.__isFirstParagraph === true
      
      // Lead paragraph styling (first paragraph after title)
      if (isFirstParagraph) {
        return (
          <p className="text-gray-900 leading-relaxed text-xl md:text-2xl font-semibold mb-6">
            {children}
          </p>
        )
      }
      
      return (
        <p className={(isQ ? '!font-bold mt-6 mb-2 ' : '') + 'text-gray-700 leading-relaxed'}>
          {children}
        </p>
      )
    },
    blockquote: ({ children }) => (
      <div className="my-16 px-4 md:px-16">
        <blockquote className="relative border-none">
          {/* Decorative quote mark */}
          <div className="absolute -top-6 left-0 text-8xl text-[#c8ab3d]/20 font-serif leading-none">&ldquo;</div>
          
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
    bullet: ({ children }) => <ul className="list-disc list-inside space-y-2 text-gray-700">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside space-y-2 text-gray-700">{children}</ol>,
  },
}

function isLikelyHeadingText(text: string): boolean {
  const t = String(text || '').trim()
  if (!t) return false
  // Reject sentences that end with punctuation
  if (/[\.!?]$/.test(t)) return false
  const words = t.split(/\s+/).filter(Boolean)
  // Much stricter heuristic: very short, no commas/colons, and clearly title-like
  if (words.length <= 8 && t.length <= 60 && !/[,:]/.test(t)) {
    const caps = words.filter(w => /^[A-Z]/.test(w)).length
    return caps >= Math.max(2, Math.ceil(words.length * 0.7))
  }
  return false
}

function normalizeBlocksForHeadings(blocks: any[]): any[] {
  try {
    let seenFirstHeadingCandidate = false
    let convertedCount = 0
    return (blocks || []).map((b, idx) => {
      if (!b || b._type !== 'block') return b
      if (b.style && b.style !== 'normal') return b
      if (b.listItem) return b // don't convert list items
      const text = extractTextFromChildren(b.children || [])
      if (!isLikelyHeadingText(text)) return b
      // Cap heading conversions to avoid overuse
      if (convertedCount >= 2) return b
      // Avoid converting consecutive blocks
      const prev = (blocks || [])[idx - 1]
      if (prev && prev._type === 'block' && (prev.style === 'h2' || prev.style === 'h3')) return b
      // First candidate -> h2, subsequent -> h3
      const style = !seenFirstHeadingCandidate ? 'h2' : 'h3'
      seenFirstHeadingCandidate = true
      convertedCount++
      return { ...b, style }
    })
  } catch {
    return blocks
  }
}

function isImagePathText(s: string): boolean {
  const t = String(s || '').trim()
  if (!t) return false
  // Markdown image syntax
  if (/!\[[^\]]*\]\([^\)]*\)/.test(t)) return true
  // Common image file extensions with path or URL
  if (/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?[^\s]*)?$)/i.test(t)) return true
  if (/([^\s]+\/)?[^\s]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(t)) return true
  // Lines starting with images/ or assets/ and ending with image extensions
  if (/^(images|image|assets|static)\/[\w\-\/]+\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(t)) return true
  return false
}

// Convert paragraphs that start with bullet glyphs (•, -, *) into semantic list items,
// and bold the label before the first colon if present.
function normalizeBulletLists(blocks: any[]): any[] {
  try {
    const startsWithBullet = (text: string): boolean => /^(\s*[•\-*]\s+)/.test(text)
    const stripBullet = (text: string): string => String(text || '').replace(/^(\s*[•\-*]\s+)/, '').trim()

    return (blocks || []).map((b) => {
      if (!b || b._type !== 'block') return b
      const rawExisting = extractTextFromChildren(Array.isArray(b.children) ? b.children : [])
      // If it's already a list item, only ensure label before colon is bolded
      if (b.listItem) {
        if (!rawExisting) return b
        const colonIndex = rawExisting.indexOf(':')
        if (colonIndex > 0) {
          const label = rawExisting.slice(0, colonIndex).trim()
          const rest = rawExisting.slice(colonIndex + 1).trim()
          const children = [
            { _type: 'span', text: label, marks: ['strong'] },
            { _type: 'span', text: rest ? `: ${rest}` : ':', marks: [] },
          ]
          return { ...b, children }
        }
        return b
      }
      const raw = rawExisting
      if (!raw || !startsWithBullet(raw)) return b

      const withoutBullet = stripBullet(raw)
      const colonIndex = withoutBullet.indexOf(':')
      let children: any[]
      if (colonIndex > 0) {
        const label = withoutBullet.slice(0, colonIndex).trim()
        const rest = withoutBullet.slice(colonIndex + 1).trim()
        children = [
          { _type: 'span', text: label, marks: ['strong'] },
          { _type: 'span', text: rest ? `: ${rest}` : ':', marks: [] },
        ]
      } else {
        children = [{ _type: 'span', text: withoutBullet, marks: [] }]
      }

      return { ...b, listItem: 'bullet', children }
    })
  } catch {
    return blocks
  }
}

function sanitizeBlocks(blocks: any[]): any[] {
  try {
    return (blocks || [])
      .map((b) => {
        // Allow only known safe types
        if (!b) return null
        // Allow custom block types: partnerQuotes, video, table, carousel, cta
        const allowedCustomTypes = ['block', 'image', 'partnerQuotes', 'video', 'table', 'carousel', 'cta']
        if (b._type && !allowedCustomTypes.includes(b._type)) return null
        if (b._type !== 'block') return b

        const children = Array.isArray(b.children) ? b.children : []
        // Drop entire block if it's just an HR marker, image path, or fenced code marker
        const wholeText = extractTextFromChildren(children)
        // RTF import noise: font names / tab markers occasionally leak into content
        const isRtfNoise = (t: string): boolean => {
          const s = String(t || '').trim()
          if (!s) return false
          // Common RTF tokens and platform-specific headers
          if (/^(rtf\d+|ansicpg\d+|cocoartf\d+|cocoatextscaling\d+|cocoaplatform\d+|fonttbl|colortbl|expandedcolortbl|pard|viewkind\d+|f\d+|cf\d+|lang\d+)$/i.test(s)) return true
          // Lines that are just font names and optional tab markers
          if (/^(Times(?:\s+New)?\s*Roman|Times-?Roman)(\s*;\s*)?(ef?tab\d+)?$/i.test(s)) return true
          // Bare tab markers
          if (/^ef?tab\d+$/i.test(s)) return true
          return false
        }
        if (isRtfNoise(wholeText)) return null
        // Remove explicit publish/updated date lines from content
        const isPublishDateLine = (t: string): boolean => {
          const s = String(t || '').trim()
          if (!s) return false
          // Common patterns: "Published on", "Published:", "Updated on", "Last updated"
          if (/^(published|updated|last\s+updated)\s*(on|:)?\s*/i.test(s)) return true
          return false
        }
        if (isPublishDateLine(wholeText)) return null
        if (/^\s*---\s*$/.test(wholeText)) return null
        if (/```/.test(wholeText)) return null
        if (isImagePathText(wholeText)) return null

        // Convert inline markdown (**bold**, *italic*, __underline__) to Portable Text marks
        const parseInlineMdToSpans = (input: string): Array<{ _type: 'span'; text: string; marks: string[] }> => {
          const spans: Array<{ _type: 'span'; text: string; marks: string[] }> = []
          let remaining = String(input || '')
          const push = (txt: string, marks: string[] = []) => {
            const t = String(txt || '')
            if (!t.trim()) return
            spans.push({ _type: 'span', text: t, marks })
          }
          while (remaining.length) {
            const boldIdx = remaining.indexOf('**')
            const underlineIdx = remaining.indexOf('__')
            const italicIdx = remaining.indexOf('*')
            const nextIdx = Math.min(
              boldIdx >= 0 ? boldIdx : Infinity,
              underlineIdx >= 0 ? underlineIdx : Infinity,
              italicIdx >= 0 ? italicIdx : Infinity
            )
            if (nextIdx === Infinity) {
              // strip inline code backticks
              push(remaining.replace(/`+/g, ''))
              break
            }
            if (nextIdx > 0) {
              push(remaining.slice(0, nextIdx).replace(/`+/g, ''))
              remaining = remaining.slice(nextIdx)
            }
            if (remaining.startsWith('**')) {
              const end = remaining.indexOf('**', 2)
              if (end > 2) {
                push(remaining.slice(2, end), ['strong'])
                remaining = remaining.slice(end + 2)
              } else {
                // unmatched marker; treat as literal
                push('**')
                remaining = remaining.slice(2)
              }
              continue
            }
            if (remaining.startsWith('__')) {
              const end = remaining.indexOf('__', 2)
              if (end > 2) {
                push(remaining.slice(2, end), ['underline'])
                remaining = remaining.slice(end + 2)
              } else {
                push('__')
                remaining = remaining.slice(2)
              }
              continue
            }
            if (remaining.startsWith('*')) {
              const end = remaining.indexOf('*', 1)
              if (end > 1) {
                push(remaining.slice(1, end), ['em'])
                remaining = remaining.slice(end + 1)
              } else {
                push('*')
                remaining = remaining.slice(1)
              }
              continue
            }
          }
          return spans.length ? spans : [{ _type: 'span', text: input, marks: [] }]
        }

        let filteredChildren = children
          .filter((c: any) => !isImagePathText(String(c?.text || '')))
          .flatMap((c: any) => parseInlineMdToSpans(String(c?.text || '')))
          // remove empty or whitespace-only spans to avoid odd gaps
          .filter((c: any) => Boolean(String(c?.text || '').trim()))

        // Convert leading markdown heading markers to proper styles
        if (filteredChildren[0] && typeof filteredChildren[0].text === 'string') {
          const m = filteredChildren[0].text.match(/^\s*(#{1,6})\s+(.*)$/)
          if (m) {
            const level = m[1].length
            const newText = m[2]
            filteredChildren[0] = { ...filteredChildren[0], text: newText }
            if (!b.style || b.style === 'normal') {
              b = { ...b, style: (`h${level}` as any) }
            }
          }
        }

        // Drop block if stripping left it empty
        const afterText = extractTextFromChildren(filteredChildren)
        if (!afterText.trim()) return null

        return { ...b, children: filteredChildren }
      })
      .filter(Boolean)
  } catch {
    return blocks
  }
}

function isQuestionText(text: string): boolean {
  const t = String(text || '').trim()
  if (!t) return false
  if (/^q\s*:\s*/i.test(t)) return true
  if (/^([A-Z][a-z]+|Interviewer|Host|Moderator|CEO|CTO|CFO)\s*:\s+/.test(t)) return true
  if (t.endsWith('?') && t.length <= 180) return true
  return false
}

function formatInterviewQA(blocks: any[]): any[] {
  try {
    const result: any[] = []
    for (const b of blocks || []) {
      if (!b || b._type !== 'block') { result.push(b); continue }
      const raw = extractTextFromChildren(b.children || [])
      const text = String(raw || '').trim()
      if (!text) { result.push(b); continue }

      // If the block looks like a question followed by an answer in the same block,
      // split into two blocks so the question can be styled independently.
      const qaMatch = text.match(/(.+?\?)(\s+.+)/)
      if (qaMatch) {
        let qText = qaMatch[1].trim()
        let aText = qaMatch[2].trim()
        // Strip leading interviewer/speaker labels from question
        qText = qText.replace(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|Interviewer|Host|Moderator|Editor|Our\s+publication)\s*:\s*/i, '').trim()
        // Strip leading name labels from answer
        aText = aText.replace(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|Martijn\s+Blanken|Interviewee|Speaker|CEO|CTO|CFO)\s*:\s*/i, '').trim()

        const qBlock = {
          ...b,
          __qa: 'Q',
          children: [{ _type: 'span', text: qText, marks: [] }],
          markDefs: [],
        }
        const aBlock = {
          ...b,
          __qa: undefined,
          children: [{ _type: 'span', text: aText, marks: [] }],
          markDefs: [],
        }
        result.push(qBlock, aBlock)
        continue
      }

      // If the block is just a question, mark it
      if (isQuestionText(text)) {
        result.push({ ...b, __qa: 'Q' })
        continue
      }

      result.push(b)
    }
    return result
  } catch {
    return blocks
  }
}

function markFirstParagraph(blocks: any[]): any[] {
  try {
    let foundFirst = false
    return blocks.map((b) => {
      // Mark the first normal paragraph (not heading, not image, etc.)
      if (!foundFirst && b._type === 'block' && b.style === 'normal') {
        foundFirst = true
        return { ...b, __isFirstParagraph: true }
      }
      return b
    })
  } catch {
    return blocks
  }
}

export default function PortableBody({ value, ads = true, interviewMode }: PortableBodyProps) {
  // Normalize incoming value to an array of blocks to avoid React child errors
  const blocks = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && (value as any)._type === 'block'
      ? [value]
      : typeof value === 'string'
        ? [{ _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: String(value), marks: [] }] }]
        : []

  if (!blocks || blocks.length === 0) return null
  // Sanitize blocks to remove stray image file names/paths and HR markers
  const sanitized = sanitizeBlocks(blocks)
  // Fallback: upgrade heading-like paragraphs when content lacks explicit h2/h3 styles
  const normalized = normalizeBulletLists(normalizeBlocksForHeadings(sanitized))
  // Mark first paragraph for lead styling
  const withLeadParagraph = markFirstParagraph(normalized)
  // Determine if interview formatting should be applied via an env flag as a safeguard
  const envEnabled = String(process.env.NEXT_PUBLIC_INTERVIEW_QA_FORMATTER || '').toLowerCase() === 'true'
  const interviewModeResolved = typeof interviewMode === 'boolean' ? interviewMode : envEnabled
  const finalBlocks = interviewModeResolved ? formatInterviewQA(withLeadParagraph) : withLeadParagraph
  const blockCount = withLeadParagraph.length
  const minBlocksForMidAd = 6
  const adsEnabled = !!ads

  if (blockCount < minBlocksForMidAd) {
    // Short content: render full content without inline ads (ads only in sidebar)
    return (
      <div className="prose prose-lg max-w-3xl mx-auto">
        <PortableText value={finalBlocks} components={components} />
      </div>
    )
  }

  // Long article: render full content without inline ads (ads only in sidebar)
  const midIndex = Math.floor(blockCount / 2)
  const firstHalf = normalized.slice(0, midIndex)
  const secondHalf = normalized.slice(midIndex)

  return (
    <div className="prose prose-lg max-w-3xl mx-auto">
      <PortableText value={interviewModeResolved ? formatInterviewQA(firstHalf) : firstHalf} components={components} />
      <PortableText value={interviewModeResolved ? formatInterviewQA(secondHalf) : secondHalf} components={components} />
    </div>
  )
}
