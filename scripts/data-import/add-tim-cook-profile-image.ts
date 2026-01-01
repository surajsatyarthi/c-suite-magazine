#!/usr/bin/env tsx
/**
 * Add Tim Cook's profile image
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { sql } from '@vercel/postgres'

async function addTimCookProfileImage() {
  console.log('📸 Adding Tim Cook profile image...\n')

  try {
    // Tim Cook official Apple executive profile photo
    // Using a reliable public image from Wikipedia/Wikimedia Commons
    const profileImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Tim_Cook_2009_cropped.jpg/440px-Tim_Cook_2009_cropped.jpg'

    const result = await sql`
      UPDATE executives
      SET profile_image_url = ${profileImageUrl},
          updated_at = NOW()
      WHERE slug = 'tim-cook'
      RETURNING id, full_name, profile_image_url
    `

    if (result.rowCount === 0) {
      console.error('❌ No executive found with slug: tim-cook')
      process.exit(1)
    }

    console.log('✅ Successfully added profile image to Tim Cook')
    console.log(`   Executive: ${result.rows[0].full_name}`)
    console.log(`   Image URL: ${result.rows[0].profile_image_url}`)

  } catch (error) {
    console.error('❌ Error adding profile image:', error)
    process.exit(1)
  }
}

addTimCookProfileImage()
