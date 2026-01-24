import { Post } from './types'

/**
 * 🛡️ The Central Ralph Resolver (v2.6)
 * This is the ONLY way URLs should be generated.
 * It prevents the CSA vs Post routing mismatch that caused Issue #47.
 */
export function getArticleUrl(post: Partial<Post>): string {
  const slug = post.slug?.current || (post.slug as any)
  if (!slug) return '#'

  const isCSA = (post as any)._type === 'csa'
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
