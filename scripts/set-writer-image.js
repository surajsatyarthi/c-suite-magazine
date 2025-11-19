#!/usr/bin/env node
// Set a writer's profile image using a local file via provided APIs (legacy authors API deprecated)

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const DEV_BASE = process.env.LOCAL_API_BASE || 'http://localhost:3010'

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (const a of args) {
    const [k, v] = a.split('=')
    if (k && v) out[k.replace(/^--/, '')] = v
  }
  return out
}

async function uploadLocalImage(filePath, filename, alt) {
  const { Blob } = require('buffer')
  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filename).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mime }), filename)
  form.append('alt', alt)
  form.append('filename', filename)
  const res = await fetch(`${DEV_BASE}/api/images`, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Image upload failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  if (!json?.ok || !json?.assetId) throw new Error(`Images API error: ${JSON.stringify(json)}`)
  return json.assetId
}

async function patchWriter(slug, assetId) {
  const res = await fetch(`${DEV_BASE}/api/writers`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    // Some Node runtimes require duplex when sending a body
    duplex: 'half',
    body: JSON.stringify({ slug, imageAssetId: assetId }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Writer update failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  if (!json?.ok) throw new Error(`Writers API error: ${JSON.stringify(json)}`)
  return json
}

async function main() {
  const { slug, file } = parseArgs()
  if (!slug || !file) {
    console.error('Usage: node scripts/set-writer-image.js --slug=priya-raman --file="/absolute/path/to/image.jpg"')
    process.exit(1)
  }
  const filename = path.basename(file).replace(/\s+/g, '-').toLowerCase()
  const alt = `Profile photo of ${slug.replace(/-/g, ' ')}`
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`)
  console.log(`→ Uploading local image: ${file}`)
  const assetId = await uploadLocalImage(file, filename, alt)
  console.log(`→ Patching writer ${slug} with assetId=${assetId}`)
  await patchWriter(slug, assetId)
  console.log(`✅ Updated ${slug} image successfully`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
