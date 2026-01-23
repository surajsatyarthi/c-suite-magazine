import 'server-only'
import { getServerClient } from '@/lib/sanity.server'
import { cache } from 'react'
import { slugifyTag } from '@/lib/tag-utils'

/**
 * CACHED: Fetch all unique tags from all posts.
 * This is an expensive operation (~600ms), so we wrap it in React cache()
 * to ensure it only runs once per render/request.
 */
export const getAllUniqueTags = cache(async (): Promise<string[]> => {
  const client = getServerClient()
  const query = `*[_type == "post" && defined(tags)].tags[]`
  
  // Optimization: Distinct on server side (GROQ doesn't do this easily for arrays, 
  // so we fetch plain strings which is lighter than objects)
  const tags: string[] = await client.fetch(query)
  
  return Array.from(new Set(tags))
})

/**
 * CACHED: Reverse lookup a tag string from a slug.
 * Uses the cached getAllUniqueTags map.
 */
export const getTagFromSlug = cache(async (slug: string): Promise<string | undefined> => {
   const allTags = await getAllUniqueTags()
   return allTags.find(t => slugifyTag(t) === slug)
})

/**
 * Fetch posts for a specific tag.
 * Uses the exact string match from the database.
 */
export async function getTagPosts(originalTag: string) {
  const query = `*[_type in ["post", "csa"] && defined(tags) && $originalTag in tags] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    "writer": writer->{name, slug, position, image},
    mainImage,
    "categories": categories[]->{title, slug, color},
    publishedAt,
    views,
    tags
  }`
  
  return getServerClient().fetch(query, { originalTag })
}
