import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
})

export function getClient(previewToken?: string) {
  // Base configuration using the read-only client
  const baseClient = client;
  
  // SANITY_API_TOKEN is our primary "read" token for private datasets
  const token = previewToken || process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;

  // For E2E tests or internal staging, we may want to view drafts globally
  const forceDrafts = process.env.SANITY_VIEW_DRAFTS === 'true';

  if (token) {
    return baseClient.withConfig({
      token,
      useCdn: !(previewToken || forceDrafts), // Bypass CDN if viewing drafts
      ignoreBrowserTokenWarning: true,
      perspective: (previewToken || forceDrafts) ? 'previewDrafts' : 'published',
    });
  }
  
  return baseClient;
}

const builder = imageUrlBuilder(client)

export function urlFor(source: unknown) {
  return builder.image(source as Parameters<typeof builder.image>[0])
}
