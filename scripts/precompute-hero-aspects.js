#!/usr/bin/env node

/**
 * Precompute hero image aspect ratios for optimal performance
 * Run this script after adding new hero images
 */

import { precomputeHeroAspects } from '../lib/heroAspects.js'

async function main() {
  console.log('🖼️  Precomputing hero image aspect ratios...')
  
  try {
    await precomputeHeroAspects()
    console.log('✅ Hero aspect ratio precomputation complete!')
  } catch (error) {
    console.error('❌ Failed to precompute hero aspects:', error)
    process.exit(1)
  }
}

main()