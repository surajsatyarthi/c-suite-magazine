#!/usr/bin/env node
/**
 * Pad Jaquar ad to portrait (1080×1920) with white background
 * Then re-upload to Sanity and update the asset ref in Tikam Jain article
 */

const sharp = require('sharp')
const https = require('https')
const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

const SANITY_TOKEN = process.env.SANITY_API_TOKEN
const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2024-10-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

// Jaquar image details
const JAQUAR_ASSET_ID = '7dcc51ed50a54b21e9397afaf18de55134b4a246'
const JAQUAR_IMAGE_URL = `https://cdn.sanity.io/images/2f93fcy8/production/${JAQUAR_ASSET_ID}-1296x880.jpg`
const JAQUAR_KEY = 'k7496wo9'
const ARTICLE_SLUG = 'tikam-jain-lodha-group-pune'

const TARGET_W = 1080
const TARGET_H = 1920
const TMP_INPUT = path.join('/tmp', 'jaquar-original.jpg')
const TMP_OUTPUT = path.join('/tmp', 'jaquar-padded.jpg')

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', reject)
  })
}

async function main() {
  console.log('⬇️  Downloading Jaquar original...')
  await downloadFile(JAQUAR_IMAGE_URL, TMP_INPUT)
  console.log('   Saved to', TMP_INPUT)

  // Get original dimensions
  const meta = await sharp(TMP_INPUT).metadata()
  console.log(`   Original: ${meta.width}×${meta.height}`)

  // Scale image to fit within TARGET_W maintaining aspect ratio
  const scaledW = TARGET_W
  const scaledH = Math.round((meta.height / meta.width) * TARGET_W)
  console.log(`   Scaled to: ${scaledW}×${scaledH}`)

  // Top/bottom padding to reach TARGET_H
  const totalPad = TARGET_H - scaledH
  const padTop = Math.floor(totalPad / 2)
  const padBottom = totalPad - padTop
  console.log(`   Padding: top=${padTop}px bottom=${padBottom}px`)

  await sharp(TMP_INPUT)
    .resize(scaledW, scaledH)
    .extend({
      top: padTop,
      bottom: padBottom,
      left: 0,
      right: 0,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .jpeg({ quality: 92 })
    .toFile(TMP_OUTPUT)

  console.log(`✅ Created padded image: ${TARGET_W}×${TARGET_H} at ${TMP_OUTPUT}`)

  // Upload to Sanity
  console.log('\n⬆️  Uploading to Sanity...')
  const fileBuffer = fs.readFileSync(TMP_OUTPUT)
  const asset = await client.assets.upload('image', fileBuffer, {
    filename: 'jaquar-ad-portrait.jpg',
    contentType: 'image/jpeg',
  })
  console.log('   New asset ID:', asset._id)
  console.log('   New asset ref:', asset._id.replace('image.', 'image-').replace(/\./g, '-'))

  // Patch the article body image block
  const doc = await client.fetch(
    `*[_type == "csa" && slug.current == $slug][0]{ _id, body }`,
    { slug: ARTICLE_SLUG }
  )

  const bodyIdx = doc.body.findIndex(b => b._key === JAQUAR_KEY)
  console.log(`\n📝 Updating body[${bodyIdx}] (key: ${JAQUAR_KEY})...`)

  await client
    .patch(doc._id)
    .set({
      [`body[${bodyIdx}].asset`]: {
        _type: 'reference',
        _ref: asset._id,
      },
    })
    .commit()

  console.log('✅ Jaquar ad updated to portrait in Sanity')
  console.log(`   Dimensions: ${TARGET_W}×${TARGET_H}`)
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
