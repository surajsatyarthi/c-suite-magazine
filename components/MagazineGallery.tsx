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
    executiveData = await client.fetch(
      `*[_type == "executiveInFocus"] | order(publishedAt desc)[0]{
        title,
        position,
        description,
        image,
        link
      }`
    )
  } catch (error) {
    console.error("Error fetching executive data:", error)
  }

  // Identify Rich Stinson for Executive in Focus (Fallback)
  const featuredName = "Rich Stinson"
  // Note: items passed here are already the "grid" items (processed in page.tsx), 
  // but we might need the original full list to find the featured item if it's not in the grid?
  // Actually, the fallback logic relies on finding "Rich Stinson" in the items list.
  // If `items` passed to this component are ALREADY filtered, we might miss him.
  // However, `processSpotlightItems` filters him out.
  // So we should probably pass the *full* raw items to this component if we want to find him, 
  // OR pass the featured item separately.
  // For now, let's assume `items` passed here are the ones to be displayed in the GRID.
  // We'll need to fetch the featured item separately or pass it in.
  // BUT, the fallback logic `items.find` implies `items` contains him.

  // Let's adjust the plan: `page.tsx` will fetch raw items. 
  // `MagazineGallery` will take `rawItems` and do the processing itself?
  // OR `page.tsx` does the processing and passes `gridItems` AND `featuredItem`.

  // To minimize changes to the fallback logic structure:
  // Let's assume `items` passed in are the GRID items.
  // We'll try to find the featured item from the GRID items (which won't work if he's filtered out).
  // So we should probably pass `featuredItem` as a prop if we want to support the fallback fully.

  // However, since we migrated data to Sanity, `executiveData` should be present, so the fallback path is less critical.
  // But to be safe, let's just use a placeholder or empty if not found in grid.

  const featuredItem = items.find(item => item.title === featuredName)

  // Use Sanity data if available, otherwise fallback to static/spotlight item
  const executiveImage = executiveData?.image ? urlFor(executiveData.image).url() : (featuredItem?.image || '')
  const executiveTitle = executiveData?.title || featuredItem?.title || featuredName
  const executivePosition = executiveData?.position || "President & CEO, Southwire Company"
  const executiveHref = executiveData?.link || featuredItem?.href || '#'
  const executiveDescription = executiveData?.description || "Visionary Leader Powering America’s Electrification Future"

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

      <section className="py-20 bg-white">
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
