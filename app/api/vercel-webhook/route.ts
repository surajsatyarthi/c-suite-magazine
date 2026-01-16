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
  } catch (error) {
    console.error('[verifySignature] Signature verification failed:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET
  const sig = req.headers.get('x-vercel-signature')

  // Read raw body for signature verification
  const rawBody = await req.text()
  const ok = verifySignature(rawBody, sig, secret)

  // Strict signature verification
  const authorized = ok
  if (!authorized) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: any // eslint-disable-line @typescript-eslint/no-explicit-any
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
  try {
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
  } catch (error) {
    console.error('[api/vercel-webhook] Failed to send Slack notification:', error)
    // Don't fail the webhook response if Slack notification fails
  }

  return NextResponse.json({ ok: true })
}
