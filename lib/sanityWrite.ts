import 'server-only'
import { getAdminClient } from './sanity.admin'

/**
 * 🛡️ Ralph Protocol v2.5: Backwards-compatibility proxy for sanityWrite.ts
 * 
 * DEPRECATED: Use lib/sanity.admin.ts directly for new code.
 * This file remains to support legacy routes while enforcing the Air-Gap Law.
 */

export function getWriteClient() {
  return getAdminClient()
}

export const writeClient = getAdminClient()
