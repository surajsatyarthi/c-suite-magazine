import OptimizedImage from '@/components/OptimizedImage'
import Link from 'next/link'
import path from 'path'
import fs from 'fs/promises'
import { client, urlFor } from '@/lib/sanity'

type SpotlightItem = {
  image: string
  href?: string
  title?: string
}

export default async function MagazineGallery() {
  const envCountRaw = process.env.NEXT_PUBLIC_SPOTLIGHT_COUNT
  const envCount = envCountRaw ? Math.max(1, Math.min(50, parseInt(envCountRaw, 10) || 0)) : undefined
  let items: SpotlightItem[] = []
  let desiredCount: number | undefined = envCount

  // Prefer static spotlight.json from public
  const publicDir = path.join(process.cwd(), 'public')
  try {
    const configPath = path.join(publicDir, 'spotlight.json')
    const raw = await fs.readFile(configPath, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) items = parsed as SpotlightItem[]
  } catch {
    items = []
  }

  // If no static config present, fall back to Sanity spotlightConfig
  if (items.length === 0) {
    try {
      const data = await client.fetch(
        `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
          cardCount,
          items[]->{ _id, title, slug, mainImage, spotlightImage, "primaryCategory": categories[0]->{ slug } }
        }`
      )
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        desiredCount = desiredCount ?? (typeof data.cardCount === 'number' ? data.cardCount : undefined)
        items = data.items
          .filter((p: any) => p !== null && p !== undefined) // Filter out null/undefined elements
          .map((p: { title?: string; slug?: { current?: string } | null; mainImage?: unknown; spotlightImage?: unknown; primaryCategory?: { slug?: { current?: string } } }, idx: number) => {
            const chosen = (p as any)?.spotlightImage || (p as any)?.mainImage
            const image = chosen ? urlFor(chosen as unknown).width(1200).height(1800).url() : `/Featured%20section/${idx + 1}.png`
            const cat = p?.primaryCategory?.slug?.current
            const postSlug = p?.slug?.current
            const href = (cat && postSlug) ? `/category/${cat}/${postSlug}` : '/archive'
            return {
              image,
              href,
              title: p?.title || 'C‑Suite Magazine Issue',
            }
          })
      }
    } catch {
      // Ignore
    }
  }

  // Custom homepage order for first 12 cards: 1,8,2,7,3,9,4,10,5,11,6,12
  // Map from original zero-based indices
  const orderMap = [0, 7, 1, 6, 2, 8, 3, 9, 4, 10, 5, 11]
  const itemsWithIndex = items.map((it, i) => ({ ...it, __idx: i + 1 }))
  const reorderedFirst12 = orderMap
    .filter((i) => i >= 0 && i < itemsWithIndex.length)
    .map((i) => itemsWithIndex[i])
  const remaining = itemsWithIndex.slice(12)
  const orderedItems = [...reorderedFirst12, ...remaining]

  // Render up to desired count (env → Sanity config → default 16)
  const maxCount = typeof desiredCount === 'number' ? desiredCount : 16
  const initialCount = Math.min(orderedItems.length, maxCount)

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-none">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4 heading-premium">
            C-suite spotlight
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our collection of exclusive issues featuring the world&apos;s top executives
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {orderedItems.slice(0, initialCount).map((item, index) => (
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
  )
}
