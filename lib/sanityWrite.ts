// Lazily initialize the Sanity write client so builds don’t fail
// when env vars aren’t present in the build environment.
import type { SanityClient } from '@sanity/client'

let cachedClient: SanityClient | null = null

function isValidProjectId(id?: string) {
  return !!id && /^[a-z0-9-]+$/.test(id)
}

export function getWriteClient(): SanityClient | null {
  if (cachedClient) return cachedClient

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-28'
  const token = process.env.SANITY_API_TOKEN

  if (!isValidProjectId(projectId) || !dataset) {
    // Avoid throwing during build; routes will handle the null client at runtime.
    console.warn('Sanity write client not configured. Missing or invalid projectId/dataset.')
    return null
  }

  // Require here to avoid evaluating the module during build when envs are missing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@sanity/client') as typeof import('@sanity/client')
  cachedClient = createClient({ projectId, dataset, apiVersion, token, useCdn: false })
  return cachedClient
}

// Backwards-compatible export used by existing routes. Will be null if not configured.
export const writeClient = getWriteClient() as any
