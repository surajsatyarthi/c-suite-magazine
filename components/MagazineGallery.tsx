import OptimizedImage from '@/components/OptimizedImage'
import ExecutiveInFocus from '@/components/ExecutiveInFocus'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { SpotlightItem } from '@/lib/spotlight'

type MagazineGalleryProps = {
  items: SpotlightItem[]
}

export default async function MagazineGallery({ items }: MagazineGalleryProps) {
  // Fetch Executive in Focus data from Sanity
  let executiveData = null
  try {
    // UAQS v2.3: Try the new config singleton first (Search-and-Select Utility)
    executiveData = await client.fetch(
      `*[_type == "executiveInFocusConfig"][0]{
        "article": featuredArticle->{
          title,
          "description": excerpt,
          "image": coalesce(spotlightImage, mainImage),
          "slug": slug.current,
          "type": _type,
          "primaryCategory": categories[0]->{ slug }
        },
        customPosition,
        customDescription
      }`
    )
    
    // If no config found, fallback to old manual document system
    if (!executiveData?.article) {
      executiveData = await client.fetch(
        `*[_type == "executiveInFocus"] | order(publishedAt desc)[0]{
          title,
          position,
          description,
          image,
          link
        }`
      )
    }
  } catch (error) {
    console.error("Error fetching executive data:", error)
  }

  // Identify Rich Stinson for Executive in Focus (Fallback)
  const featuredName = "Rich Stinson"
  
  // Resolve final variables from combined data sources
  let executiveImage = ''
  let executiveTitle = ''
  let executivePosition = ''
  let executiveHref = '#'
  let executiveDescription = ''
  let featuredItem: SpotlightItem | undefined = undefined

  if (executiveData?.article) {
    // New Config System Path
    const art = executiveData.article
    executiveImage = art.image ? urlFor(art.image).url() : ''
    executiveTitle = art.title || ''
    executivePosition = executiveData.customPosition || "Principal Executive"
    executiveDescription = executiveData.customDescription || art.description || ''
    
    if (art.slug) {
      const cat = art.primaryCategory?.slug?.current || 'cxo-interview'
      executiveHref = art.type === 'csa' ? `/csa/${art.slug}` : `/category/${cat}/${art.slug}`
    }
  } else if (executiveData) {
    // Old Manual System Path
    executiveImage = executiveData.image ? urlFor(executiveData.image).url() : ''
    executiveTitle = executiveData.title || ''
    executivePosition = executiveData.position || ''
    executiveHref = executiveData.link || '#'
    executiveDescription = executiveData.description || ''
  } else {
    // Total Fallback (Rich Stinson)
    featuredItem = items.find(item => item.title === featuredName)
    executiveImage = featuredItem?.image || ''
    executiveTitle = featuredItem?.title || featuredName
    executivePosition = "President & CEO, Southwire Company"
    executiveHref = featuredItem?.href || '#'
    executiveDescription = "Visionary Leader Powering America's Electrification Future"
  }

  return (
    <>
      {(executiveData || featuredItem) && (
        <ExecutiveInFocus
          image={executiveImage}
          title={executiveTitle}
          position={executivePosition}
          href={executiveHref}
          description={executiveDescription}
        />
      )}

      <section className="py-20 bg-white" id="csuite-spotlight">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-none">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4 heading-premium">
              C-Suite Spotlight
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Browse our collection of exclusive issues featuring the world&apos;s top executives
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {items.map((item, index) => (
              <Link
                key={`${index}`}
                href={item.href || '/archive'}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 card-hover-scale"
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-gray-200">
                  <OptimizedImage
                    src={item.image || `/Featured%20section/${index + 1}.png`}
                    alt={item.title || 'C‑Suite Magazine Issue'}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    quality={90}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 20vw"
                    loading="lazy"
                  />
                  {/* Number badge removed per requirement */}
                  {/* Views removed per rule: featured section does not display views */}

                  {/* Strong dark overlay on hover for text readability */}
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Overlay - Only visible on hover ('View issue' with arrow) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                    <p className="text-sm font-semibold tracking-wide" style={{ color: '#ffffff' }}>
                      View issue →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Read More CTA removed per request */}
        </div>
      </section>
    </>
  )
}
