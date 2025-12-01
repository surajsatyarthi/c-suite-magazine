import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import https from 'https'
import fs from 'fs'
import { basename } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: 'production', // Force production
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2024-10-28',
    useCdn: false,
})

async function fixImage() {
    const slug = 'stella-ambrose-visionary-trailblazer-in-sustainable-palm-oil-leadership'
    console.log(`Fetching article: ${slug}`)

    const doc = await client.fetch(`*[_type == "csa" && slug.current == $slug][0] {
    _id,
    mainImage {
      asset->
    }
  }`, { slug })

    if (!doc || !doc.mainImage || !doc.mainImage.asset) {
        console.error('❌ Article or image not found.')
        return
    }

    const oldUrl = doc.mainImage.asset.url
    console.log(`Found old image URL: ${oldUrl}`)

    if (!oldUrl.includes('production-fixed')) {
        console.log('⚠️ Image URL does not seem to point to production-fixed. Proceeding anyway...')
    }

    // Download image
    const tempPath = join(__dirname, 'temp_stella.png')
    console.log(`Downloading to ${tempPath}...`)

    await downloadFile(oldUrl, tempPath)

    // Upload to production
    console.log('Uploading to production dataset...')
    const newAsset = await client.assets.upload('image', fs.createReadStream(tempPath), {
        filename: 'stella-fixed.png'
    })

    console.log(`✅ Uploaded new asset: ${newAsset._id}`)

    // Patch document
    console.log('Updating article...')
    await client.patch(doc._id)
        .set({
            mainImage: {
                ...doc.mainImage,
                asset: {
                    _type: 'reference',
                    _ref: newAsset._id
                }
            }
        })
        .commit()

    console.log('✅ Article updated with new image asset.')

    // Cleanup
    fs.unlinkSync(tempPath)
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest)
        https.get(url, (response) => {
            response.pipe(file)
            file.on('finish', () => {
                file.close(resolve)
            })
        }).on('error', (err) => {
            fs.unlink(dest)
            reject(err)
        })
    })
}

fixImage()
