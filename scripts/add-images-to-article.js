#!/usr/bin/env node
/**
 * Phase 3: Upload images and insert into Indian Oil article
 * Auto-match images to article sections based on PDF structure
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_WRITE_TOKEN,
    apiVersion: '2024-01-01',
    useCdn: false
})

const DRAFT_ID = 'drafts.l1PaX4hS53uLi0tV4V3Bog'
const IMAGES_DIR = '/Users/surajsatyarthi/Desktop/IO Images'

function generateKey() {
    return crypto.randomBytes(6).toString('hex')
}

// Mapping images to article sections based on filenames and PDF structure
const IMAGE_MAPPING = {
    // Hero image (mainImage field)
    hero: '166732579516492313851649231183SMVaidya_INDIANOILCORP_MAIN_V2-768x853.jpg',

    // Article body images with positions (block index to insert after)
    bodyImages: [
        {
            file: '166732579716492313871649231185SMVaidya_INDIANOILCORP_Support1-768x469.jpg',
            afterBlock: 5, // After intro paragraphs
            alt: 'IndianOil operations overview'
        },
        {
            file: 'SMVaidya_INDIANOILCORP_Support7-1024x680-1.jpg',
            afterBlock: 15, // Around "Energy Hungry" section
            alt: 'IndianOil refinery operations'
        },
        {
            file: 'SMVaidya_INDIANOILCORP_Support8-1024x680-1.jpg',
            afterBlock: 25, // Around "Hydrogen Export Hub" section
            alt: 'Green hydrogen facility'
        },
        {
            file: 'SMVaidya_INDIANOILCORP_Support9-1024x680-1.jpg',
            afterBlock: 35, // Mid-article
            alt: 'Industrial infrastructure'
        },
        {
            file: 'SMVaidya_INDIANOILCORP_Support10-1024x680-1.jpg',
            afterBlock: 45, // Later section
            alt: 'Logistics and distribution'
        },
        {
            file: 'SMVaidya_INDIANOILCORP_Support11-1024x680-1.jpg',
            afterBlock: 55, // Near end
            alt: 'Technical operations'
        }
    ]
}

async function uploadImage(filePath, filename) {
    console.log(`Uploading ${filename}...`)
    const stream = fs.createReadStream(filePath)
    const asset = await client.assets.upload('image', stream, {
        filename,
        timeout: 30000
    })
    console.log(`  ✅ Uploaded: ${asset._id}`)
    return asset
}

async function addImagesToArticle() {
    try {
        console.log('Fetching article draft...')
        const article = await client.getDocument(DRAFT_ID)

        if (!article) {
            console.error('❌ Draft not found')
            process.exit(1)
        }

        console.log(`✅ Found article with ${article.body?.length || 0} blocks\n`)

        // Upload hero image
        console.log('=== Step 1: Upload Hero Image ===')
        const heroPath = path.join(IMAGES_DIR, IMAGE_MAPPING.hero)
        const heroAsset = await uploadImage(heroPath, IMAGE_MAPPING.hero)

        // Upload body images
        console.log('\n=== Step 2: Upload Body Images ===')
        const bodyImageAssets = []
        for (const img of IMAGE_MAPPING.bodyImages) {
            const imgPath = path.join(IMAGES_DIR, img.file)
            if (fs.existsSync(imgPath)) {
                const asset = await uploadImage(imgPath, img.file)
                bodyImageAssets.push({ asset, ...img })
            } else {
                console.log(`⚠️  Image not found: ${img.file}`)
            }
        }

        // Insert images into body
        console.log('\n=== Step 3: Insert Images into Article Body ===')
        let newBody = [...article.body]

        // Sort by position (descending) so we insert from end to start (preserve indices)
        const sortedImages = bodyImageAssets.sort((a, b) => b.afterBlock - a.afterBlock)

        for (const { asset, afterBlock, alt } of sortedImages) {
            const imageBlock = {
                _key: generateKey(),
                _type: 'image',
                asset: {
                    _ref: asset._id,
                    _type: 'reference'
                },
                alt
            }

            // Insert after specified block
            newBody.splice(afterBlock + 1, 0, imageBlock)
            console.log(`  ✅ Inserted image after block ${afterBlock}`)
        }

        console.log(`\nTotal blocks: ${article.body.length} → ${newBody.length}`)

        // Update article
        console.log('\n=== Step 4: Update Article ===')
        const result = await client
            .patch(DRAFT_ID)
            .set({
                mainImage: {
                    asset: {
                        _ref: heroAsset._id,
                        _type: 'reference'
                    },
                    alt: 'IndianOil Chairman Shrikant Madhav Vaidya'
                },
                body: newBody
            })
            .commit()

        console.log('✅ Article updated successfully!')
        console.log(`\nFinal stats:`)
        console.log(`- Hero image: Set`)
        console.log(`- Body images: ${bodyImageAssets.length} added`)
        console.log(`- Total blocks: ${result.body.length}`)
        console.log(`\nView: http://localhost:3000/studio/structure/csa-articles;l1PaX4hS53uLi0tV4V3Bog`)

    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error(error)
        process.exit(1)
    }
}

addImagesToArticle()
