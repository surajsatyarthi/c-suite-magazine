import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

// REMOVED getClient() for security (Issue #12).
// Use server-only getServerClient() from '@/lib/sanity.server' for authenticated fetches.

const builder = imageUrlBuilder(client)

export function urlFor(source: unknown) {
  return builder.image(source as Parameters<typeof builder.image>[0])
}
