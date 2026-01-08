import path from 'path'
import fs from 'fs/promises'
import { client, urlFor } from '@/lib/sanity'

export type SpotlightItem = {
    image: string
    href?: string
    title?: string
    __idx?: number
}

export async function getSpotlightItems(): Promise<{ items: SpotlightItem[], desiredCount: number | undefined }> {
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

    return { items, desiredCount }
}

export function processSpotlightItems(items: SpotlightItem[], desiredCount: number | undefined, featuredName: string = "Rich Stinson"): SpotlightItem[] {
    // Filter out the featured item from the grid items
    const gridItems = items.filter(item => item.title !== featuredName)

    // Respect the order from spotlight.json - no custom reordering
    const maxCount = typeof desiredCount === 'number' ? desiredCount : 12
    const initialCount = Math.min(gridItems.length, maxCount)

    return gridItems.slice(0, initialCount)
}
