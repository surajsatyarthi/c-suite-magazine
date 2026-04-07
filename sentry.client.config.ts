import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Low sample rate — avoids quota blowout on a high-traffic magazine site
  tracesSampleRate: 0.05,
  // Only enable replay on errors (not all sessions)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  debug: false,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})
