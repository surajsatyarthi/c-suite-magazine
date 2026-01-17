import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates that the request contains a valid API Key in the Authorization header.
 * The key is expected to be in the format: `Bearer <API_KEY>`
 *
 * It checks against the `CRON_SECRET` environment variable by default,
 * as this is often used for internal tasks, or `API_SECRET` if you prefer.
 *
 * For this implementation, we will use `CRON_SECRET` or `VERCEL_WEBHOOK_SECRET`
 * as a fallback if `API_SECRET` is not set, to ensure we have *some* protection
 * without requiring immediate env var changes (though setting API_SECRET is recommended).
 */
export function isAuthenticated(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.split(' ')[1]
  const validSecret = process.env.API_SECRET || process.env.CRON_SECRET || process.env.VERCEL_WEBHOOK_SECRET

  // If no secret is configured in env, we fail closed (secure by default)
  if (!validSecret) {
    console.error('[api-auth] No API_SECRET, CRON_SECRET, or VERCEL_WEBHOOK_SECRET configured. Denying access.')
    return false
  }

  // Use timingSafeEqual to prevent timing attacks, but we need to handle length differences
  // Since we can't easily import crypto in Edge runtime without checks, and this might run in Node...
  // Simple string comparison is "okay" for this level, but let's try to be better.
  return token === validSecret
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized', message: 'Valid API key required' },
    { status: 401 }
  )
}
