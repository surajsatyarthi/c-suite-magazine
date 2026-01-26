import 'server-only'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * 🛡️ Ralph Protocol v2.5: Standard Server Client (Read-Only)
 * 
 * Use this for standard data fetching and previews.
 * For write operations, use lib/sanity.admin.ts.
 */
export const serverClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: {
    enabled: false, // Default off for server productivity
    studioUrl: '/studio',
  },
})

/**
 * Get a configured server client for read/preview operations.
 * @param previewToken - Optional preview token from draft mode.
 */
export function getServerClient(previewToken?: string) {
  if (previewToken) {
    return serverClient.withConfig({
      token: previewToken,
      useCdn: false,
      ignoreBrowserTokenWarning: true,
      perspective: 'previewDrafts',
      stega: {
        enabled: true,
        studioUrl: '/studio',
      },
    });
  }
  
  return serverClient;
}
