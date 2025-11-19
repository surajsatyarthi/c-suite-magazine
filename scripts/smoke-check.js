#!/usr/bin/env node
// Simple pre-deploy smoke checks for key pages and image optimizer

const base = process.env.SMOKE_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'

async function fetchOk(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (res.status === 401 && process.env.ALLOW_401 === '1') {
    console.warn(`Preview protected (401) for ${url}; allowing due to ALLOW_401`)
    return res
  }
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res
}

async function checkPage(path) {
  const url = base.replace(/\/$/, '') + path
  const res = await fetchOk(url)
  const csp = res.headers.get('content-security-policy') || res.headers.get('content-security-policy-report-only') || ''
  if (!/img-src[^;]*https:/.test(csp) && !/img-src[^;]*'self'/.test(csp)) {
    console.warn(`Warning: CSP 'img-src' may be missing https allowlist on ${url}`)
  }
  const html = await res.text()
  // Fail if any RTF control words leak into rendered HTML
  if (/(\brtf1\b|\bansicpg\d+\b|\bcocoartf\d+\b|\bcocoasubrtf\d+\b)/i.test(html)) {
    throw new Error(`RTF artifact detected on ${url}`)
  }
  console.log(`OK page ${url}`)
}

async function checkImage(path) {
  const url = base.replace(/\/$/, '') + path
  const res = await fetchOk(url)
  const ct = res.headers.get('content-type') || ''
  if (res.status === 401 && process.env.ALLOW_401 === '1') {
    console.warn(`Preview protected (401) on image ${url}; skipping content-type check`)
    console.log(`OK image (protected) ${url}`)
    return
  }
  if (!ct.startsWith('image/')) throw new Error(`${url} not image content-type: ${ct}`)
  console.log(`OK image ${url}`)
}

async function checkOptimizer(remoteUrl, w = 1200, q = 75) {
  const u = base.replace(/\/$/, '') + `/_next/image?url=${encodeURIComponent(remoteUrl)}&w=${w}&q=${q}`
  const res = await fetchOk(u)
  const ct = res.headers.get('content-type') || ''
  if (res.status === 401 && process.env.ALLOW_401 === '1') {
    console.warn(`Preview protected (401) on optimizer ${u}; skipping content-type check`)
    console.log(`OK optimizer (protected) ${u}`)
    return
  }
  if (!ct.startsWith('image/')) throw new Error(`optimizer response not image: ${ct}`)
  console.log(`OK optimizer ${u}`)
}

async function main() {
  console.log(`Running smoke checks against ${base}`)
  await checkPage('/')
  await checkImage('/hero-image.png')
  await checkImage('/Featured%20section/1.png')
  await checkOptimizer('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&h=800&fit=crop')
  const res = await fetchOk(base.replace(/\/$/, '') + '/category/cxo-interview/angelina-usanova')
  if (res.status === 401 && process.env.ALLOW_401 === '1') {
    console.log('OK article page (protected)')
  } else {
    const html = await res.text()
    if (!/Featured%20hero\//i.test(html)) throw new Error('Article hero not served from Featured hero')
    if (/object-contain/i.test(html)) throw new Error('Article hero using object-contain')
    if (/Featured%20section\//i.test(html)) throw new Error('Featured section asset present on article page')
    const relatedSection = html.split(/Related Articles/i)[1] || ''
    const relatedImgCount = (relatedSection.match(/<img\b/gi) || []).length
    if (relatedImgCount < 2) throw new Error('Related Articles missing images')
    if (/\/category\/cxo-interview\/angelina-usanova/i.test(relatedSection)) throw new Error('Current article appears in Related Articles')
  }

  const slugs = [
    'angelina-usanova',
    'olga-denysiuk',
    'stoyana-natseva',
    'brianne-howey',
    'dr-basma-ghandourah',
    'erin-krueger',
    'bill-faruki',
    'pankaj-bansal',
    'supreet-nagi',
    'swami-aniruddha',
    'bryce-tully',
    'cal-riley',
    'john-zangardi',
    'bryan-smeltzer',
    'dean-fealk',
    'benjamin-borketey',
  ]
  for (const slug of slugs) {
    const url = base.replace(/\/$/, '') + `/category/cxo-interview/${slug}`
    const r = await fetchOk(url)
    if (r.status === 401 && process.env.ALLOW_401 === '1') {
      console.log(`OK article page (protected) ${url}`)
      continue
    }
    const html = await r.text()
    if (!/Featured%20hero\//i.test(html)) throw new Error(`Hero not from Featured hero: ${url}`)
    if (/object-contain/i.test(html)) throw new Error(`Hero using object-contain: ${url}`)
    if (/Featured%20section\//i.test(html)) throw new Error(`Featured section asset present on article page: ${url}`)
    const relatedSection = html.split(/Related Articles/i)[1] || ''
    const relatedImgCount = (relatedSection.match(/<img\b/gi) || []).length
    if (relatedImgCount < 2) throw new Error(`Related missing images: ${url}`)
    const selfPath = `/category/cxo-interview/${slug}`
    if (new RegExp(selfPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(relatedSection)) {
      throw new Error(`Current article appears in Related: ${url}`)
    }
    console.log(`OK article checks ${url}`)
  }
}

main().catch((err) => {
  console.error('Smoke checks failed:', err?.message || err)
  process.exit(1)
})
