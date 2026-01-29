const { createClient } = require('next-sanity')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_WRITE_TOKEN, // Needs write access
    useCdn: false,
})

const AD_ID = 'clNGIHR7teKIrj4L6FqRKA'
const IMAGE_PATH = path.join(__dirname, '../public/vertical_ad.png')

async function uploadImage() {
    try {
        console.log(`Reading image from ${IMAGE_PATH}...`)
        if (!fs.existsSync(IMAGE_PATH)) {
            throw new Error(`File not found: ${IMAGE_PATH}`)
        }
        const fileStream = fs.createReadStream(IMAGE_PATH)

        console.log('Uploading image to Sanity...')
        const asset = await client.assets.upload('image', fileStream, {
            filename: 'vertical_ad.png',
        })

        console.log(`Image uploaded! Asset ID: ${asset._id}`)

        console.log(`Updating Ad Document ${AD_ID}...`)
        await client
            .patch(AD_ID)
            .set({
                image: {
                    _type: 'image',
                    asset: {
                        _type: 'reference',
                        _ref: asset._id,
                    },
                },
            })
            .commit()

        console.log('✅ Ad updated successfully with the correct image!')
    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

uploadImage()
