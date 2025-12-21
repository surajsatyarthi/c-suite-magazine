// Ensures the local folder is linked to the existing Vercel project
// Skips on Vercel's own build environment (VERCEL=1)
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function log(msg) {
  console.log(`[vercel-preflight] ${msg}`)
}

try {
  // Skip on Vercel cloud builds
  if (String(process.env.VERCEL) === '1') {
    log('Running on Vercel; skipping local link verification.')
    process.exit(0)
  }

  // Skip on CI environments (GitHub Actions, etc.) - no Vercel credentials available
  if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
    log('Running in CI environment; skipping Vercel link verification.')
    process.exit(0)
  }

  const vercelDir = path.join(process.cwd(), '.vercel')
  const projectJson = path.join(vercelDir, 'project.json')

  const isLinked = fs.existsSync(projectJson)

  if (isLinked) {
    log('Project appears linked (.vercel/project.json present).')
    process.exit(0)
  }

  log('Project not linked. Attempting non-interactive link to existing project...')
  try {
    // Attempt to link to the known project name; requires prior Vercel login
    execSync('npx vercel link --project ceo-magazine --yes', { stdio: 'inherit' })
    const linked = fs.existsSync(projectJson)
    if (!linked) {
      throw new Error('Link succeeded but .vercel/project.json not found')
    }
    log('Link successful. Using existing Vercel project: ceo-magazine')
    process.exit(0)
  } catch (err) {
    console.error('[vercel-preflight] Failed to link project automatically.')
    console.error('[vercel-preflight] Error:', err?.message || String(err))
    console.error('[vercel-preflight] Please run: npx vercel link --project ceo-magazine --yes')
    process.exit(1)
  }
} catch (err) {
  console.error('[vercel-preflight] Fatal error:', err?.message || String(err))
  process.exit(1)
}

