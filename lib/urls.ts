import { Post } from './types'


/**
 * 🛡️ The Central Ralph Resolver (v2.6)
 * This is the ONLY way URLs should be generated.
 * It prevents the CSA vs Post routing mismatch that caused Issue #47.
 */
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
