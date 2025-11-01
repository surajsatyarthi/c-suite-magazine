import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'

type AdProps = {
  placement: 'article-sidebar' | 'article-sidebar-large' | 'in-article' | 'homepage-banner' | 'homepage-sidebar' | 'footer-banner'
  className?: string
}

async function fetchAd(placement: string) {
  const query = `*[_type == "advertisement" && placement == $placement && isActive == true && (!defined(startDate) || startDate <= now()) && (!defined(endDate) || endDate >= now())] | order(priority desc)[0] {
    _id,
    name,
    image,
    targetUrl,
    placement,
    dimensions,
    isActive,
    priority
  }`
  return client.fetch(query, { placement })
}

export default async function Ad({ placement, className }: AdProps) {
  const ad = await fetchAd(placement)

  if (!ad) {
    return (
      <div className={className}>
        <div className="bg-white rounded p-8 flex items-center justify-center" style={{ minHeight: '250px' }}>
          <div className="text-gray-400 text-center">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <p className="text-sm">Ad slot: {placement}</p>
          </div>
        </div>
      </div>
    )
  }

  const width = ad?.dimensions?.width || (placement === 'article-sidebar-large' ? 300 : placement === 'homepage-banner' ? 970 : placement === 'in-article' ? 728 : 300)
  const height = ad?.dimensions?.height || (placement === 'article-sidebar-large' ? 600 : placement === 'homepage-banner' ? 250 : placement === 'in-article' ? 90 : 250)

  const imageUrl = urlFor(ad.image).width(width).height(height).url()
  const isSidebar = placement === 'article-sidebar' || placement === 'article-sidebar-large'
  const isBanner = placement === 'homepage-banner' || placement === 'footer-banner'
  const isInArticle = placement === 'in-article'

  // Responsive sizes: sidebar fills container on <= lg, caps on desktop
  const sizes = isSidebar
    ? '(max-width: 1024px) 100vw, 300px'
    : isBanner
    ? '(max-width: 1024px) 100vw, 970px'
    : isInArticle
    ? '(max-width: 1024px) 100vw, 728px'
    : '(max-width: 640px) 100vw, 300px'

  return (
    <div className={className}>
      <Link href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
        <div
          className={`relative w-full ${isSidebar ? 'lg:max-w-[300px]' : ''} ${isBanner ? 'max-w-[970px] mx-auto' : ''} ${isInArticle ? 'max-w-[728px] mx-auto' : ''}`}
          style={{ aspectRatio: `${width}/${height}` }}
        >
          <OptimizedImage
            src={imageUrl}
            alt={ad.image?.alt || ad.name || 'Sponsored'}
            fill
            className="rounded object-contain"
            sizes={sizes}
            priority
          />
        </div>
      </Link>
    </div>
  )
}
