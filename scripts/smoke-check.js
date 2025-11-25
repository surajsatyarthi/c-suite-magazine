/* eslint-disable */
const https = require('https')

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk.toString()
        if (data.length > 500000) {
          req.destroy()
          resolve(data.slice(0, 500000))
        }
      })
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
  })
}

async function fetchJson(url) {
  const text = await fetchText(url)
  try {
    return JSON.parse(text)
  } catch (e) {
    return null
  }
}

async function run() {
  const base = process.env.SITE_URL || 'https://csuitemagazine.global'
  const failures = []

  const home = await fetchText(`${base}/`)
  if (!home || !(home.includes('aria-label=\"Search\"') || home.includes('aria-label="Search"'))) {
    failures.push('Header search control not found on homepage')
  }

  const cats = await fetchJson(`${base}/api/categories`)
  const catSlugs = Array.isArray(cats?.categories) ? cats.categories.map(c => c.slug).slice(0, 5) : []
  if (catSlugs.length === 0) {
    failures.push('No categories returned by /api/categories')
  } else {
    for (const slug of catSlugs) {
      const html = await fetchText(`${base}/category/${encodeURIComponent(slug)}`)
      if (!html || html.includes('General | C-Suite Magazine')) {
        failures.push(`Category page renders as General for slug: ${slug}`)
        break
      }
    }
  }

  const rss = await fetchText(`${base}/rss.xml`)
  const firstLinkMatch = rss && rss.match(/<link>(https:[^<]+\/category\/[\w\-]+\/[^<]+)<\/link>/)
  const articleUrl = firstLinkMatch ? firstLinkMatch[1] : null
  if (!articleUrl) {
    failures.push('Could not extract an article URL from RSS')
  } else {
  const article = await fetchText(articleUrl)
  if (!article || !(article.includes('data-ad=\"article-sidebar-large\"') || article.includes('data-ad="article-sidebar-large"') || article.includes('vertical_ad.png') || article.includes('Sponsored'))) {
    failures.push('Sidebar ad not detected on article page')
  }
  }

  if (failures.length) {
    console.error('[SMOKE] FAIL', failures)
    process.exit(1)
  } else {
    console.log('[SMOKE] PASS')
  }
}

run().catch((e) => {
  console.error('[SMOKE] ERROR', e?.message || String(e))
  process.exit(1)
})
