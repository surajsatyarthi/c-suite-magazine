import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { notifySlack, formatDeployMessage } from '@/lib/notify'

function verifySignature(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!secret) return false
  if (!signature) return false
  try {
    const hmac = crypto.createHmac('sha256', secret)
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET
  const sig = req.headers.get('x-vercel-signature')

  // Read raw body for signature verification
  const rawBody = await req.text()
  const ok = verifySignature(rawBody, sig, secret)

  // Allow fallback via query param for testing if signature missing
  const testSecret = req.nextUrl.searchParams.get('secret')
  const authorized = ok || (secret && testSecret === secret)
  if (!authorized) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    body = { raw: rawBody }
  }

  // Extract common fields regardless of event shape
  const project = body?.project?.name || body?.name || 'ceo-magazine'
  const url = body?.url || body?.deployment?.url || undefined
  const createdAt = body?.createdAt || body?.deployment?.createdAt || Date.now()
  const region = body?.region || body?.deployment?.region || undefined
  const state = body?.readyState || body?.state || body?.deployment?.state || 'UNKNOWN'
  const type = body?.type || 'event'
  const error = body?.error?.message || body?.error || undefined

  // Decide notification
  if (String(state).toUpperCase() === 'ERROR' || type.includes('error')) {
    await notifySlack(
      formatDeployMessage({ status: 'FAILED', url, project, createdAt, region, error })
    )
  } else if (String(state).toUpperCase() === 'READY' || type.includes('ready')) {
    await notifySlack(
      formatDeployMessage({ status: 'READY', url, project, createdAt, region })
    )
  } else if (String(state).toUpperCase() === 'BUILDING' || type.includes('created')) {
    await notifySlack(
      formatDeployMessage({ status: 'BUILDING', url, project, createdAt, region })
    )
  }

  return NextResponse.json({ ok: true })
}
