import { NextResponse } from 'next/server'
import pkg from '@/package.json'
import { BUILD_VERSION, COMMIT_SHA } from '@/lib/buildInfo'

function decodeDayAndTime(version: string) {
  const m = version.match(/^([0-3])\.([0-9]{2})\.([0-9]{4})$/)
  if (!m) return null
  const hundreds = parseInt(m[1], 10)
  const tail = parseInt(m[2], 10)
  const day = hundreds * 100 + tail
  const hhmm = m[3]
  const hour = parseInt(hhmm.slice(0, 2), 10)
  const minute = parseInt(hhmm.slice(2, 4), 10)
  if (day < 1 || day > 366) return null
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { dayOfYear: day, time24h: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` }
}

export async function GET() {
  const version = BUILD_VERSION || pkg.version
  const commit = COMMIT_SHA
  const deployment = process.env.VERCEL_URL || null
  const decoded = typeof version === 'string' ? decodeDayAndTime(version) : null
  const body = {
    version,
    commit,
    deployment,
    decoded,
  }
  const res = NextResponse.json(body)
  res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
  return res
}
