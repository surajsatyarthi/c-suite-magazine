import Image from 'next/image'
import { client, urlFor } from '@/lib/sanity'

interface AdData {
  _id: string
  name: string
  image: any
  targetUrl: string
  placement: string
  dimensions?: {
    width: number
    height: number
  }
  openInNewTab: boolean
}

interface AdProps {
  placement: string
  className?: string
}

async function getActiveAd(placement: string): Promise<AdData | null> {
  const now = new Date().toISOString()
  
  const query = `*[
    _type == "advertisement" && 
    placement == $placement && 
    isActive == true &&
    (!defined(startDate) || startDate <= $now) &&
    (!defined(endDate) || endDate >= $now)
  ] | order(priority desc) [0] {
    _id,
    name,
    image,
    targetUrl,
    placement,
    dimensions,
    openInNewTab
  }`
  
  try {
    return await client.fetch(query, { placement, now })
  } catch (error) {
    console.error(`Failed to fetch ad for placement: ${placement}`, error)
    return null
  }
}

export default async function Ad({ placement, className = '' }: AdProps) {
  const ad = await getActiveAd(placement)
  
  // If no ad found, show placeholder
  if (!ad) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Advertisement</p>
          <div className="bg-white rounded p-8 flex items-center justify-center" style={{ minHeight: '250px' }}>
            <div className="text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Ad Space: {placement}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const imageUrl = urlFor(ad.image).url()
  const width = ad.dimensions?.width || 300
  const height = ad.dimensions?.height || 250
  const target = ad.openInNewTab ? '_blank' : '_self'
  const rel = ad.openInNewTab ? 'noopener noreferrer' : undefined
  
  return (
    <div className={`ad-container ${className}`}>
      <a 
        href={ad.targetUrl} 
        target={target}
        rel={rel}
        className="block hover:opacity-90 transition-opacity"
      >
        <Image
          src={imageUrl}
          alt={ad.image.alt || 'Advertisement'}
          width={width}
          height={height}
          className="w-full h-auto"
          priority={false}
        />
      </a>
      <p className="text-xs text-gray-400 text-center mt-1">Advertisement</p>
    </div>
  )
}
