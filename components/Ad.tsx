import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'

type AdProps = {
  placement: 'article-sidebar-large' | 'in-article'
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

  // Force local vertical ad for article sidebar large if no CMS ad is configured
  if (placement === 'article-sidebar-large' && !ad) {
    const localFallbackUrl = '/vertical_ad.png'
    const target = 'https://www.brabus.com/en-int/cars/classics/C4S192C.html'
    const width = 300
    const height = 600
    const sizes = '(max-width: 1024px) 100vw, 300px'

    return (
      <div className={className}>
        <Link href={target} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
          <div
            className={`relative w-full lg:max-w-[300px] mx-auto`}
            style={{ aspectRatio: `${width}/${height}` }}
          >
            <OptimizedImage
              src={localFallbackUrl}
              alt={'Sponsored'}
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

  // Fallback for in-article when CMS ad missing
  if (!ad && placement === 'in-article') {
    const localFallbackUrl = '/vertical_ad.png'
    const target = 'https://www.brabus.com/en-int/cars/classics/C4S192C.html'
    const width = 728
    const height = 90
    const sizes = '(max-width: 1024px) 100vw, 728px'

    return (
      <div className={className}>
        <Link href={target} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
          <div
            className={`relative w-full max-w-[728px] mx-auto`}
            style={{ aspectRatio: `${width}/${height}` }}
          >
            <OptimizedImage
              src={localFallbackUrl}
              alt={'Sponsored'}
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

  const width = ad?.dimensions?.width || (placement === 'in-article' ? 728 : 300)
  const height = ad?.dimensions?.height || (placement === 'in-article' ? 90 : 600)

  const imageUrl = urlFor(ad.image).width(width).height(height).auto('format').url()
  const isInArticle = placement === 'in-article'

  // Responsive sizes: sidebar fills container on <= lg, caps on desktop
  const sizes = isInArticle
    ? '(max-width: 1024px) 100vw, 728px'
    : '(max-width: 640px) 100vw, 300px'

  return (
    <div className={className}>
      <Link href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
        <div className={`relative w-full ${isInArticle ? 'max-w-[728px] mx-auto' : 'lg:max-w-[300px] mx-auto'}`} style={{ aspectRatio: `${width}/${height}` }}>
          <OptimizedImage
            src={imageUrl}
            alt={ad.image?.alt || ad.name || 'Sponsored'}
            fill
            className="rounded object-contain"
            sizes={sizes}
          />
        </div>
      </Link>
    </div>
  )
}
