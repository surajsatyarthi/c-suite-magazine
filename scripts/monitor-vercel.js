// Monitors latest Vercel deployment status for a project and alerts on failure
// Usage:
//   node scripts/monitor-vercel.js
// Env required:
//   VERCEL_TOKEN (API token)
//   VERCEL_PROJECT_NAME (default: ceo-magazine)
//   VERCEL_TEAM_ID (optional)
//   SLACK_WEBHOOK_URL (optional, for alerts)

// Node 18+ has global fetch
const PROJECT_NAME = process.env.VERCEL_PROJECT_NAME || 'ceo-magazine'
const TEAM_ID = process.env.VERCEL_TEAM_ID || undefined
const TOKEN = process.env.VERCEL_TOKEN
const SLACK = process.env.SLACK_WEBHOOK_URL

if (!TOKEN) {
  console.error('VERCEL_TOKEN is required')
  process.exit(1)
}

async function api(path, init = {}) {
  const url = new URL(`https://api.vercel.com${path}`)
  if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID)
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

async function getProjectId(name) {
  const res = await api(`/v9/projects/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error(`Failed to get project: ${res.status}`)
  const data = await res.json()
  return data.id
}

async function getLatestDeployment(projectId) {
  const res = await api(`/v6/deployments?projectId=${projectId}&limit=1`)
  if (!res.ok) throw new Error(`Failed to list deployments: ${res.status}`)
  const data = await res.json()
  const [latest] = data.deployments || []
  return latest
}

async function notifySlack(message) {
  if (!SLACK) {
    console.log('[monitor] Slack not configured. Message:', message)
    return
  }
  try {
    await fetch(SLACK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    })
  } catch (err) {
    console.error('[monitor] Failed to send Slack notification:', err)
  }
}

function fmt(deploy) {
  const when = deploy?.createdAt ? new Date(deploy.createdAt).toISOString() : new Date().toISOString()
  return [
    `Deployment ${deploy?.readyState || deploy?.state || 'UNKNOWN'}`,
    `Project: ${PROJECT_NAME}`,
    deploy?.url ? `URL: https://${deploy.url}` : undefined,
    deploy?.region ? `Region: ${deploy.region}` : undefined,
    `Time: ${when}`,
  ].filter(Boolean).join('\n')
}

async function main() {
  const projectId = await getProjectId(PROJECT_NAME)
  console.log('[monitor] Project ID:', projectId)

  const timeoutMs = 15 * 60 * 1000
  const intervalMs = 10 * 1000
  const start = Date.now()

  while (Date.now() - start < timeoutMs) {
    const latest = await getLatestDeployment(projectId)
    if (!latest) {
      console.log('[monitor] No deployments found; retrying...')
      await new Promise(r => setTimeout(r, intervalMs))
      continue
    }

    const state = String(latest.readyState || latest.state || 'UNKNOWN').toUpperCase()
    console.log('[monitor] State:', state)

    if (state === 'READY') {
      const msg = fmt(latest)
      await notifySlack(msg)
      console.log(msg)
      process.exit(0)
    }
    if (state === 'ERROR' || state === 'CANCELED') {
      const msg = fmt(latest)
      await notifySlack(msg)
      console.error(msg)
      process.exit(2)
    }

    await new Promise(r => setTimeout(r, intervalMs))
  }

  console.error('[monitor] Timed out waiting for deployment to finish')
  process.exit(3)
}

main().catch(async (err) => {
  console.error('[monitor] Fatal error:', err)
  await notifySlack(`[monitor] Fatal error: ${err?.message || String(err)}`)
  process.exit(1)
})

