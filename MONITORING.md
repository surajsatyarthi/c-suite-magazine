# Deployment Monitoring & Alerts

This project includes two mechanisms to ensure you’re informed about deployment status and failures on Vercel.

## 1) Webhook Alerts (recommended)

- Endpoint: `POST /api/vercel-webhook`
- Configure in Vercel → Project Settings → Webhooks → Add webhook:
  - URL: `https://csuitemagazine.global/api/vercel-webhook?secret=$VERCEL_WEBHOOK_SECRET`
  - Events: Deployment created, ready, error
- Environment variables (set in Vercel Project settings):
  - `VERCEL_WEBHOOK_SECRET`: random string used to verify the `x-vercel-signature` header (sha256 HMAC)
  - `SLACK_WEBHOOK_URL` (optional): Incoming webhook URL to send alerts

### What it does
- Verifies signature using `sha256` HMAC
- Sends Slack notifications for BUILDING, READY, and FAILED states
- Falls back to query param `?secret=` for test/debug if signature header isn’t present

## 2) CLI Monitor Script (local/CI fallback)

- Script: `scripts/monitor-vercel.js`
- Requirements:
  - Node 18+
  - Env vars:
    - `VERCEL_TOKEN`: Vercel API token
    - `VERCEL_PROJECT_NAME`: default `ceo-magazine`
    - `VERCEL_TEAM_ID`: optional
    - `SLACK_WEBHOOK_URL`: optional for Slack alerts
- Usage:
  ```bash
  node scripts/monitor-vercel.js
  ```
- Behavior:
  - Polls the latest deployment via Vercel API every 10s (up to 15min)
  - Exits `0` on READY
  - Exits `2` on ERROR/CANCELED (and notifies Slack if configured)
  - Exits `3` on timeout

## Notes
- If you prefer, you can use Vercel’s Slack integration directly from the Vercel Dashboard.
- The webhook route requires your production domain to be reachable if you use the apex URL above; for testing, you can use preview URLs or localhost tunneling.

