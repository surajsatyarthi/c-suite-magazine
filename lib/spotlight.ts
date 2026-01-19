import { client, urlFor } from './sanity'

export type SpotlightItem = {
    image: string
    href?: string
    title?: string
    rawImage?: any
    __idx?: number
}

export async function getSpotlightItems(): Promise<{ items: SpotlightItem[], desiredCount: number | undefined }> {
    try {
        const envCountRaw = process.env.NEXT_PUBLIC_SPOTLIGHT_COUNT
        const envCount = envCountRaw ? Math.max(1, Math.min(50, parseInt(envCountRaw, 10) || 0)) : undefined
        let items: SpotlightItem[] = []
        let desiredCount: number | undefined = envCount

        // UAQS v2.2: Fetch EXCLUSIVELY from Sanity spotlightConfig (Physical Ground Truth)
        try {
            const data = await client.fetch(
                `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
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
            if (data && Array.isArray(data.items)) {
                // Simplified: Spotlight Grid is now always exactly 12 articles
                desiredCount = desiredCount ?? 12
                
                if (data.items.length > 0) {
                    items = data.items
                        .filter((p: any) => p !== null && p !== undefined)
                        .map((p: any, idx: number) => {
                            const chosen = p.spotlightImage || p.mainImage
                            // Use Sanity Image Builder for all assets (Guideline IV Cleanup)
                            let image = `/Featured%20section/${idx + 1}.png` // fallback
                            try {
                                if (chosen && (chosen.asset || chosen._ref)) {
                                    image = urlFor(chosen).width(1200).height(1800).url()
                                }
                            } catch (e) {
                                console.error(`[spotlight] Failed to build URL for item ${idx} ("${p.title}"):`, e)
                            }
                            
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
            }
        } catch (e) {
            console.error('[getSpotlightItems] Failed to fetch/process spotlight data:', e)
        }
        
        return { items, desiredCount }
    } catch (e) {
        console.error('[getSpotlightItems] FATAL ERROR - returning empty data:', e)
        return { items: [], desiredCount: undefined }
    }
}

export function processSpotlightItems(items: SpotlightItem[], desiredCount: number | undefined, featuredName: string = "Rich Stinson"): SpotlightItem[] {
    // Spotlight Grid now follows strict 12-article requirement
    const maxCount = typeof desiredCount === 'number' ? desiredCount : 12
    
    // We just take the top items from the config directly
    return items.slice(0, maxCount)
}
