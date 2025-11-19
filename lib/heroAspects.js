/**
 * Hero image aspect ratio caching for optimal performance
 * Precomputed ratios eliminate need for dynamic sharp imports during runtime
 */

import { promises as fs } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cache file path
const CACHE_FILE = join(__dirname, '../tmp/hero-aspects.json')

// Precomputed aspect ratios for common hero images
const DEFAULT_RATIOS = {
  '/hero-image.png': 1.778, // 16:9 ratio
  '/hero-image.webp': 1.778,
  '/popup-ad.png': 1.764, // 970/550
  '/popup-ad%202.png': 1.764,
  '/popup-ad 2.png': 1.764,
  '/popup-ad-2.png': 1.764,
  '/popup-ad-2.jpg': 1.764,
  '/pop%20up%20ad%202.png': 1.764
}

/**
 * Get cached aspect ratio for a hero image
 * Falls back to default ratios or 16:9 if not found
 */
export async function getHeroAspectRatio(imagePath) {
  try {
    // Try to load cached ratios
    const cacheData = await loadCache()
    if (cacheData[imagePath]) {
      return cacheData[imagePath]
    }
    
    // Fall back to default ratios
    if (DEFAULT_RATIOS[imagePath]) {
      return DEFAULT_RATIOS[imagePath]
    }
    
    // Default to 16:9 ratio for unknown images
    return 1.778
  } catch (error) {
    console.warn('Failed to get hero aspect ratio:', error)
    return 1.778 // 16:9 fallback
  }
}

/**
 * Precompute aspect ratios for all hero images
 * Run this during build time to populate cache
 */
export async function precomputeHeroAspects() {
  try {
    // Ensure cache directory exists
    await fs.mkdir(dirname(CACHE_FILE), { recursive: true })
    
    // Start with default ratios
    const ratios = { ...DEFAULT_RATIOS }
    
    // Add any additional hero images from the public directory
    const publicDir = join(__dirname, '../public')
    try {
      const files = await fs.readdir(publicDir)
      for (const file of files) {
        if (file.match(/^hero-.*\.(png|jpg|jpeg|webp)$/i)) {
          const imagePath = `/${file}`
          if (!ratios[imagePath]) {
            // Default to 16:9 for new hero images
            ratios[imagePath] = 1.778
          }
        }
      }
    } catch (dirError) {
      // Public directory might not exist during build
      console.log('Public directory not found, using default ratios')
    }
    
    // Save to cache
    await saveCache(ratios)
    console.log(`✅ Cached aspect ratios for ${Object.keys(ratios).length} hero images`)
    
  } catch (error) {
    console.error('❌ Failed to precompute hero aspects:', error)
    throw error
  }
}

/**
 * Load aspect ratio cache from disk
 */
async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Cache doesn't exist yet, return empty object
    return {}
  }
}

/**
 * Save aspect ratio cache to disk
 */
async function saveCache(ratios) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(ratios, null, 2))
}

/**
 * Clear the aspect ratio cache
 */
export async function clearHeroAspectCache() {
  try {
    await fs.unlink(CACHE_FILE)
    console.log('✅ Hero aspect ratio cache cleared')
  } catch (error) {
    // Cache file might not exist
    console.log('ℹ️  No cache file to clear')
  }
}