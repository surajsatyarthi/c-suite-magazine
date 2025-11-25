const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function getCommit() {
  try {
    const envSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || process.env.COMMIT_SHA
    if (envSha && typeof envSha === 'string' && envSha.length >= 7) return envSha
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    return sha || null
  } catch {
    return null
  }
}

function writeBuildInfo() {
  const pkgPath = path.join(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  const version = pkg.version || null
  const commit = getCommit()
  const outDir = path.join(process.cwd(), 'lib')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const target = path.join(outDir, 'buildInfo.ts')
  const content = [
    `export const BUILD_VERSION = ${JSON.stringify(version)} as string`,
    `export const COMMIT_SHA = ${JSON.stringify(commit)} as string | null`,
  ].join('\n') + '\n'
  fs.writeFileSync(target, content, 'utf8')
  console.log(`[write-build-info] version=${version} commit=${commit || 'null'} → lib/buildInfo.ts`)
}

try {
  writeBuildInfo()
} catch (e) {
  console.error('[write-build-info] Failed:', e?.message || String(e))
  process.exit(0) // Do not block builds if commit is unavailable
}

