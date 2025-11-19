/**
 * Submit URLs to IndexNow (Bing, Yandex, etc.)
 * Requirements:
 *  - Ensure the key file exists at: public/<KEY>.txt with content equal to the key
 */

const fetch = global.fetch

const KEY = '8f3b1a7f2c8d4e6f9ab0c3d1e5f7a9b2'
const HOST = 'csuitemagazine.global'
const ENDPOINT = 'https://api.indexnow.org/indexnow'

const urls = [
  `https://${HOST}/`,
  `https://${HOST}/sitemap.xml`,
  `https://${HOST}/category/leadership`,
  `https://${HOST}/category/innovation`,
  `https://${HOST}/category/business`,
  `https://${HOST}/category/manufacturing`,
]

async function run() {
  try {
    const body = {
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls,
    }
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    console.log('IndexNow status:', res.status)
    console.log('IndexNow response:', text)
  } catch (err) {
    console.error('IndexNow submission failed:', err)
    process.exit(1)
  }
}

run()
