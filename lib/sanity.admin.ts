import 'server-only'
import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * 🛡️ Ralph Protocol v2.5: Air-Gapped Admin Client
 * 
 * MANDATORY: This client is the ONLY authorized gateway for write operations.
 * It is physically protected by 'server-only' to prevent token leakage.
 */

let cachedAdminClient: SanityClient | null = null;

export function getAdminClient(): SanityClient {
  if (cachedAdminClient) return cachedAdminClient;

  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

  if (!token) {
    // During build time, we allow this to return a dummy client or null if handled.
    // However, for runtime mutations, we MUST have a token.
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Critical Security Failure: SANITY_WRITE_TOKEN is missing in production server environment.');
    }
  }

  cachedAdminClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Write operations must always hit the primary
    token,
    ignoreBrowserTokenWarning: true, // server-only ensures this is safe
  });

  return cachedAdminClient;
}

/**
 * Backwards-compatible singleton for standard server-side usage.
 */
export const adminClient = getAdminClient();

/**
 * Audit-log wrapped write operation
 * This ensures every mutation is traceable to an Issue ID.
 */
export async function authenticatedMutation(issueId: string, mutation: any) {
  console.log(`[SECURITY-AUDIT] Issue ${issueId} performing mutation at ${new Date().toISOString()}`)
  return getAdminClient().mutate(mutation)
}
