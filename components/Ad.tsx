import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import InArticleAd from '@/components/InArticleAd'
import { ADS } from '@/lib/adInterstitial/constants'

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

  // Fallback: Brabus Ad for Sidebar (if no Sanity ad found)
  if (placement === 'article-sidebar-large' && (!ad || !ad.image)) {
    // Explicitly fetch the Brabus ad by ID to ensure it shows as the fallback
    const BRABUS_AD_ID = 'clNGIHR7teKIrj4L6FqRKA'
    const fallbackAd = await client.fetch(`*[_id == $id][0]{
      name,
      image,
      targetUrl,
      dimensions
    }`, { id: BRABUS_AD_ID })

    if (fallbackAd && fallbackAd.image) {
      const width = fallbackAd.dimensions?.width || 300
      const height = fallbackAd.dimensions?.height || 600
      const imageUrl = urlFor(fallbackAd.image).width(width).height(height).auto('format').url()
      const sizes = '(max-width: 1024px) 100vw, 300px'

      return (
        <div className={className}>
          <Link href={fallbackAd.targetUrl || '#'} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-[#c8ab3d] focus:ring-offset-2">
            <div
              className={`relative w-full lg:max-w-[300px] mx-auto`}
              style={{ aspectRatio: `${width}/${height}` }}
            >
              <OptimizedImage
                src={imageUrl}
                alt={fallbackAd.name || 'Sponsored'}
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
  }

  // Return null if no ad is found (for in-article or if fallback fails)
  if (!ad || !ad.image) {
    return null
  }

  const width = ad?.dimensions?.width || (placement === 'in-article' ? 728 : 300)
  const height = ad?.dimensions?.height || (placement === 'in-article' ? 90 : 600)

  const imageUrl = urlFor(ad.image).width(width).height(height).auto('format').url()
  const isInArticle = placement === 'in-article'

  // Responsive sizes: sidebar fills container on <= lg, caps on desktop
  const sizes = isInArticle
    ? '(max-width: 1024px) 100vw, 728px'
    : '(max-width: 640px) 100vw, 300px'

  if (isInArticle) {
    return (
      <InArticleAd
        image={imageUrl}
        href={ad.targetUrl}
        title={ad.name || 'Sponsored'}
        width={width}
        height={height}
        className={className}
      />
    )
  }

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
