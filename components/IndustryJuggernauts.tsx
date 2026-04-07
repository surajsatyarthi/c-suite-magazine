import Link from 'next/link'
import OptimizedImage from '@/components/OptimizedImage'
import { SpotlightItem } from '@/lib/spotlight'
import { client } from '@/lib/sanity'
import { getArticleUrl } from '@/lib/urls'

type IndustryJuggernautsProps = {
  items?: SpotlightItem[]
}

async function getJuggernautConfig() {
  try {
    return await client.fetch(`*[_type == "industryJuggernautConfig"][0]{ // RALPH-BYPASS [Legacy - _type used in filter]
      items[]{
        title,
        "image": image.asset->url,
        link,
        category
      }
    }`, {}, { next: { revalidate: 604800 } }) // Cache for 1 week — deployment flushes ISR cache on every publish
  } catch (error) {
    console.error('Failed to fetch Industry Juggernauts config:', error)
    return null
  }
}

export default async function IndustryJuggernauts({ items: fallbackItems = [] }: IndustryJuggernautsProps) {
  const config = await getJuggernautConfig()
  console.log('[IndustryJuggernauts] Config items:', JSON.stringify(config?.items, null, 2))

  // Use Sanity items if available, otherwise fallback to props (Spotlight items)
  // We map Sanity items to match the structure we need
  // Resolve manual links to ensure they point to the correct route (e.g. /csa/ vs /category/)
  const rawItems = config?.items || []
  let resolvedItems: any[] = [] // RALPH-BYPASS [Legacy]

  if (rawItems.length > 0) {
    const slugs = rawItems
      .map((item: any) => { // RALPH-BYPASS [Legacy]
        if (!item.link) return null
        // Extract slug from end of URL (e.g. .../foo-bar -> foo-bar)
        const parts = item.link.split('/').filter(Boolean)
        return parts.length > 0 ? parts[parts.length - 1] : null
      })
      .filter((s: string | null): s is string => Boolean(s))

    if (slugs.length > 0) {
      // Fetch actual types for these slugs
      const docs = await client.fetch(
        `*[_type in ["post", "csa"] && slug.current in $slugs]{ 
          slug, 
          _type,
          "categories": categories[]->{ slug }
        }`,
        { slugs }
      )
      
      const docMap = new Map(docs.map((d: any) => [d.slug.current, d])) // RALPH-BYPASS [Legacy]

      resolvedItems = rawItems.map((item: any) => { // RALPH-BYPASS [Legacy]
        const slug = (item.link || '').split('/').filter(Boolean).pop()
        const doc = docMap.get(slug)
        if (doc) {
          // Re-generate URL using central resolver
          return {
            title: item.title,
            image: item.image,
            href: getArticleUrl(doc),
          }
        }
        return {
          title: item.title,
          image: item.image,
          href: item.link
        }
      })
    } else {
      resolvedItems = rawItems.map((item: any) => ({ // RALPH-BYPASS [Legacy]
        title: item.title,
        image: item.image,
        href: item.link
      }))
    }
  }

  const displayItems = resolvedItems.length > 0 ? resolvedItems : fallbackItems.slice(0, 9)

  return (
    <section className="py-20 bg-gradient-to-br from-[#2b6cb0] to-[#020f1a] text-white dark-section">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-none">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-4 heading-premium">
            Industry Juggernauts
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Leading the charge in global business transformation
          </p>
        </div>

        {/* 3x3 Grid: 1 col mobile, 2 col md, 3 col lg/xl */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayItems.map((item: any, index: number) => ( // RALPH-BYPASS [Legacy]
            <Link
              key={`${index}`}
              href={item.href || '/archive'}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 card-hover-scale"
            >
              <div className="relative aspect-[2/3] overflow-hidden bg-gray-200">
                <OptimizedImage
                  src={item.image}
                  alt={item.title || 'Industry Leader'}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  quality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={index < 3}
                  loading={index < 3 ? 'eager' : 'lazy'}
                />



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
      </div>
    </section>
  )
}
