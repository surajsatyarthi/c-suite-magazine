import fs from 'fs'
import path from 'path'

// Resolve public Featured hero image for CXO pages
export function resolveFeaturedHeroImage(p: any): string | null {
    try {
        const dir = path.join(process.cwd(), 'public', 'Featured hero')
        const files = fs.readdirSync(dir)
        const rawName = String(p?.writer?.name || '').trim()
        const rawSlug = String(p?.slug?.current || p?.slug || '').trim()
        const rawTitle = String(p?.title || '').trim()

        const normalize = (s: string) => s
            .toLowerCase()
            .replace(/\./g, '')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ') // collapse whitespace
            .trim()

        const name = normalize(rawName)
        const slug = normalize(rawSlug)
        const title = normalize(rawTitle)

        // Prefer exact normalized matches first (avoids accidental partial includes)
        const normalizedMap = files.map((f) => ({
            file: f,
            base: f.replace(/\.(png|jpg|jpeg|webp)$/i, ''),
            norm: normalize(f.replace(/\.(png|jpg|jpeg|webp)$/i, '')),
        }))

        // 1) Exact matches on slug or writer name
        let match = normalizedMap.find((x) => x.norm === slug) || normalizedMap.find((x) => x.norm === name)

        // 2) Includes fallback (both directions) and subject name from title
        // Require minimum length to avoid false positives
        if (!match && slug.length > 3 && name.length > 3) {
            match =
                normalizedMap.find((x) => x.norm.length > 3 && x.norm.includes(slug)) ||
                normalizedMap.find((x) => x.norm.length > 3 && x.norm.includes(name)) ||
                normalizedMap.find((x) => x.norm.length > 3 && slug.includes(x.norm)) ||
                normalizedMap.find((x) => x.norm.length > 3 && name.includes(x.norm)) ||
                normalizedMap.find((x) => x.norm.length > 3 && title.includes(x.norm))
        }

        if (!match) return null
        const baseNoExt = match.base
        const webpExact = files.find((f) => f.toLowerCase() === `${baseNoExt.toLowerCase()}.webp`)
        const chosen = webpExact || match.file
        return `/Featured hero/${chosen}`
    } catch {
        return null
    }
}

// Resolve public Featured section rectangular image for full articles
export function resolveFeaturedSectionImage(p: any): string | null {
    try {
        const dir = path.join(process.cwd(), 'public', 'Featured section')
        const files = fs.readdirSync(dir)
        const rawName = String(p?.writer?.name || '').trim()
        const rawSlug = String(p?.slug?.current || p?.slug || '').trim()
        const rawTitle = String(p?.title || '').trim()

        const normalize = (s: string) => s
            .toLowerCase()
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

        const name = normalize(rawName)
        const slug = normalize(rawSlug)
        const title = normalize(rawTitle)

        const normalizedMap = files.map((f) => ({
            file: f,
            base: f.replace(/\.(png|jpg|jpeg|webp)$/i, ''),
            norm: normalize(f.replace(/\.(png|jpg|jpeg|webp)$/i, '')),
        }))

        // Prefer exact normalized matches first
        let match = normalizedMap.find((x) => x.norm === slug) || normalizedMap.find((x) => x.norm === name)

        // Includes fallback (both directions) and subject name from title
        // Require minimum length to avoid false positives
        if (!match && slug.length > 3 && name.length > 3) {
            match =
                normalizedMap.find((x) => x.norm.length > 3 && x.norm.includes(slug)) ||
                normalizedMap.find((x) => x.norm.length > 3 && x.norm.includes(name)) ||
                normalizedMap.find((x) => x.norm.length > 3 && slug.includes(x.norm)) ||
                normalizedMap.find((x) => x.norm.length > 3 && name.includes(x.norm)) ||
                normalizedMap.find((x) => x.norm.length > 3 && title.includes(x.norm))
        }

        if (!match) return null
        return `/Featured section/${match.file}`
    } catch {
        return null
    }
}
