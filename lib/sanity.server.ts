import 'server-only'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * Server-only Sanity client with token support.
 * Use this for high-privilege reads (drafts) or write operations.
 */
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN,
  perspective: process.env.SANITY_VIEW_DRAFTS === 'true' ? 'previewDrafts' : 'published',
})

/**
 * Get a configured server client.
 * @param previewToken - Optional preview token from draft mode.
 */
export function getServerClient(previewToken?: string) {
  const token = previewToken || process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN;
  const forceDrafts = process.env.SANITY_VIEW_DRAFTS === 'true';

  if (token) {
    return serverClient.withConfig({
      token,
      useCdn: !(previewToken || forceDrafts),
      ignoreBrowserTokenWarning: true,
      perspective: (previewToken || forceDrafts) ? 'previewDrafts' : 'published',
    });
  }
  
  return serverClient;
}
