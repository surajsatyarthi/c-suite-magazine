import { Post } from './types'


/**
 * 🛡️ The Central Ralph Resolver (v2.6)
 * This is the ONLY way URLs should be generated.
 * It prevents the CSA vs Post routing mismatch that caused Issue #47.
 */

/**
 * Dynamically resolves the frontend base URL based on the environment.
 * Prevents Sanity Studio from using its own origin for previews.
 */
export function getBaseUrl(): string {
  // 1. Explicit Frontend URL override (Manual config)
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL
  }

  // 2. Browser Context (detect if we are in a Sanity Studio environment)
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    // If we are NOT on a Sanity hosted domain, we can trust the current origin
    // (This covers localhost:3000/studio and custom studio domains)
    if (!origin.includes('sanity.studio') && !origin.includes('sanity.io')) {
      return origin
    }
  }

  // 3. Vercel System Variable (available in build and sometimes runtime)
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // 4. Fallback to production
  return 'https://csuitemagazine.global'
}

export function getCategoryUrl(categorySlug: string): string {
  // Enforce lowercase
  const slug = categorySlug?.toLowerCase() || 'leadership'
  return `/category/${slug}`
}

export function getArticleUrl(post: Partial<Post>): string {
  const slug = post.slug?.current || (post.slug as any)
  if (!slug) return '#'

  // Priority 1: CSA (Company Sponsored)
  // Must check both _type and potential 'csa' category explicitly
  const isCSA = (post as any)._type === 'csa' || 
                (post as any).type === 'csa' 

  if (isCSA) {
    return `/csa/${slug}`
  }

  // Handle standard posts with categories
  const categories = (post as any).categories
  const catSlug = (Array.isArray(categories) && categories.length > 0) 
    ? (categories[0].slug?.current || categories[0].slug || 'leadership')
    : 'leadership'

  return `/category/${catSlug}/${slug}`
}

export function getWriterUrl(writer: any): string {
  const slug = writer?.slug?.current || writer?.slug
  if (!slug) return '#'
  return `/writer/${slug}`
}
