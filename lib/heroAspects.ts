import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

// Cache for hero image aspect ratios
const heroAspectCache = new Map<string, number>()
const CACHE_FILE = path.join(process.cwd(), 'tmp', 'hero-aspects.json')

interface HeroAspectData {
  [key: string]: number
}

/**
 * Load cached hero aspect ratios from disk
 */
async function loadCache(): Promise<void> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8')
    const parsed = JSON.parse(data) as HeroAspectData
    Object.entries(parsed).forEach(([key, value]) => {
      heroAspectCache.set(key, value)
    })
  } catch {
    // Cache file doesn't exist yet, start with empty cache
  }
}

/**
 * Save cache to disk
 */
async function saveCache(): Promise<void> {
  try {
    const data: HeroAspectData = {}
    for (const [key, value] of heroAspectCache.entries()) {
      data[key] = value
    }
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true })
    await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Failed to save hero aspect cache:', error)
  }
}

/**
 * Get aspect ratio for a hero image (with caching)
 */
export async function getHeroAspectRatio(imagePath: string): Promise<number> {
  // Load cache on first use
  if (heroAspectCache.size === 0) {
    await loadCache()
  }
  
  // Check cache first
  if (heroAspectCache.has(imagePath)) {
    return heroAspectCache.get(imagePath)!
  }
  
  try {
    // Get image metadata using sharp
    const absolutePath = path.join(process.cwd(), 'public', imagePath.replace(/^\//, ''))
    const metadata = await sharp(absolutePath).metadata()
    
    if (metadata.width && metadata.height && metadata.width > 0 && metadata.height > 0) {
      const aspectRatio = metadata.width / metadata.height
      
      // Cache the result
      heroAspectCache.set(imagePath, aspectRatio)
      
      // Save cache to disk (don't await, let it run in background)
      saveCache().catch(console.error)
      
      return aspectRatio
    }
  } catch (error) {
    console.error(`Failed to get aspect ratio for ${imagePath}:`, error)
  }
  
  // Default fallback
  return 16 / 9
}

/**
 * Precompute aspect ratios for all hero images
 */
export async function precomputeHeroAspects(): Promise<void> {
  const heroDir = path.join(process.cwd(), 'public', 'Featured hero')
  
  try {
    const files = await fs.readdir(heroDir)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    )
    
    console.log(`Precomputing aspect ratios for ${imageFiles.length} hero images...`)
    
    for (const file of imageFiles) {
      const imagePath = `/Featured hero/${file}`
      await getHeroAspectRatio(imagePath)
    }
    
    console.log('Hero aspect ratio precomputation complete')
  } catch (error) {
    console.error('Failed to precompute hero aspects:', error)
  }
}

// Initialize cache on module load
loadCache().catch(() => {}) // Ignore errors on initial load