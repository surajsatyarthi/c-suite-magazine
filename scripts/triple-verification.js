#!/usr/bin/env node
const https = require('https')

function head(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ status: res.statusCode, headers: res.headers })
    })
    req.on('error', reject)
    req.end()
  })
}

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk.toString()
        if (data.length > 500000) {
          req.destroy()
          resolve({ status: res.statusCode, headers: res.headers, body: data.slice(0, 500000) })
        }
      })
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }))
    })
    req.on('error', reject)
  })
}

async function run() {
  const base = process.env.TRIPLE_BASE_URL || process.env.SITE_URL || 'https://csuitemagazine.global'
  const failures = []

  const targets = ['/', '/sitemap.xml', '/robots.txt', '/archive', '/about', '/contact']
  for (const path of targets) {
    try {
      const { status } = await head(`${base}${path}`)
      if (status !== 200) failures.push(`${path} -> ${status}`)
    } catch (e) {
      failures.push(`${path} -> error`)
    }
  }

  try {
    const { headers } = await head(`${base}/`)
    const csp = (headers['content-security-policy'] || '').toLowerCase()
    const hsts = (headers['strict-transport-security'] || '').toLowerCase()
    const xfo = (headers['x-frame-options'] || '').toUpperCase()
    const vary = (headers['vary'] || '').toLowerCase()
    const server = (headers['server'] || '').toLowerCase()
    const vercelCache = headers['x-vercel-cache'] || ''

    if (!csp.includes('connect-src') || !csp.includes('sanity') || !csp.includes('wss:')) failures.push('CSP connect-src missing sanity/wss')
    if (xfo !== 'DENY') failures.push('X-Frame-Options not DENY')
    if (!(hsts.includes('max-age') && hsts.includes('preload'))) failures.push('HSTS missing preload or max-age')
    if (!vary.includes('next-router-state-tree')) failures.push('Vary missing next-router-state-tree')
    if (server !== 'vercel') failures.push('Server header not Vercel')
    if (!vercelCache) failures.push('x-vercel-cache missing')
  } catch (e) {
    failures.push('Header verification error')
  }

  try {
    const rss = await get(`${base}/rss.xml`)
    if (rss.status !== 200) {
      failures.push('rss.xml status not 200')
    } else {
      const m = rss.body.match(/<link>(https:[^<]+\/category\/[\w\-]+\/[^<]+)<\/link>/)
      if (!m) {
        failures.push('RSS missing article link')
      } else {
        const articleUrl = m[1]
        const article = await get(articleUrl)
        if (article.status !== 200) {
          failures.push('Article link not 200')
        } else {
          const b = article.body || ''
          if (!(b.includes('data-ad="article-sidebar-large"') || b.includes('data-ad="article-sidebar-large"'.replace(/"/g, '"')) || b.includes('vertical_ad.png') || b.includes('Sponsored'))) {
            failures.push('Article sidebar ad marker missing')
          }
        }
      }
    }
  } catch (e) {
    failures.push('RSS verification error')
  }

  if (failures.length) {
    console.error('[TRIPLE] FAIL', failures.join(' | '))
    process.exit(1)
  } else {
    console.log('[TRIPLE] PASS')
  }
}

run().catch((e) => {
  console.error('[TRIPLE] ERROR', e?.message || String(e))
  process.exit(1)
})
