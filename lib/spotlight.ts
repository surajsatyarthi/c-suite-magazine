import { client, urlFor } from './sanity'

export type SpotlightItem = {
    image: string
    href?: string
    title?: string
    rawImage?: any
    __idx?: number
}

export async function getSpotlightItems(): Promise<{ items: SpotlightItem[], desiredCount: number | undefined }> {
    const envCountRaw = process.env.NEXT_PUBLIC_SPOTLIGHT_COUNT
    const envCount = envCountRaw ? Math.max(1, Math.min(50, parseInt(envCountRaw, 10) || 0)) : undefined
    let items: SpotlightItem[] = []
    let desiredCount: number | undefined = envCount

    // UAQS v2.2: Fetch EXCLUSIVELY from Sanity spotlightConfig (Physical Ground Truth)
    try {
        const data = await client.fetch(
            `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
          cardCount,
          items[]->{ 
            _id, 
            _type,
            title, 
            slug, 
            mainImage, 
            spotlightImage, 
            "primaryCategory": categories[0]->{ slug } 
          }
        }`,
            {},
            { useCdn: false }
        )
        if (data && Array.isArray(data.items) && data.items.length > 0) {
            desiredCount = desiredCount ?? (typeof data.cardCount === 'number' ? data.cardCount : undefined)
            items = data.items
                .filter((p: any) => p !== null && p !== undefined)
                .map((p: any, idx: number) => {
                    const chosen = p.spotlightImage || p.mainImage
                    // Use Sanity Image Builder for all assets (Guideline IV Cleanup)
                    const image = chosen 
                        ? urlFor(chosen).width(1200).height(1800).url() 
                        : `/Featured%20section/${idx + 1}.png`
                    
                    const cat = p.primaryCategory?.slug?.current || 'cxo-interview'
                    const postSlug = p.slug?.current

                    // HARDENED REDIRECT LOGIC: Ensure canonical mapping
                    let href = '/archive'
                    if (postSlug) {
                        href = (p._type === 'csa') 
                            ? `/csa/${postSlug}` 
                            : `/category/${cat}/${postSlug}`
                    }
                    
                    return {
                        image,
                        href,
                        title: p.title || 'C‑Suite Magazine Issue',
                        rawImage: chosen
                    }
                })
        }
    } catch (e) {
        console.error('[lib/spotlight] Sanity fetch failed:', e)
        items = []
    }

    return { items, desiredCount }
}

export function processSpotlightItems(items: SpotlightItem[], desiredCount: number | undefined, featuredName: string = "Rich Stinson"): SpotlightItem[] {
    // UAQS v2.2 Hardened: Respect business requirement for 13 items
    // Removed filtering of featuredName to allow Rich Stinson in the grid
    const maxCount = typeof desiredCount === 'number' ? desiredCount : 13
    
    // We just take the top items from the config directly
    return items.slice(0, maxCount)
}
