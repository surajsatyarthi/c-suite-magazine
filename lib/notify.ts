import 'server-only'
export async function notifySlack(message: string) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) {
    console.warn('[notifySlack] SLACK_WEBHOOK_URL not set. Message:', message)
    return
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })
  } catch (err) {
    console.error('[notifySlack] Failed to send Slack notification:', err)
  }
}

export function formatDeployMessage({
  status,
  url,
  project,
  createdAt,
  region,
  error,
}: {
  status: string
  url?: string
  project?: string
  createdAt?: number
  region?: string
  error?: string
}) {
  const time = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
  const base = `Vercel Deployment ${status}`
  const bits = [
    project ? `Project: ${project}` : undefined,
    url ? `URL: ${url}` : undefined,
    region ? `Region: ${region}` : undefined,
    `Time: ${time}`,
    error ? `Error: ${error}` : undefined,
  ].filter(Boolean)
  return [base, ...bits].join('\n')
}
