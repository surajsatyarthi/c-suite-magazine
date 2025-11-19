// Convert PNG Featured hero images to WebP using sharp
// Outputs to the same folder with .webp extension, preserving 1920x1080
// Usage: node scripts/optimize-featured-hero.js

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const dir = path.join(__dirname, '..', 'public', 'Featured hero')
const publicDir = path.join(__dirname, '..', 'public')

async function main() {
  // Convert homepage hero-image.png to WebP as well
  try {
    const heroPng = path.join(publicDir, 'hero-image.png')
    const heroWebp = path.join(publicDir, 'hero-image.webp')
    if (fs.existsSync(heroPng)) {
      const img = sharp(heroPng)
      const meta = await img.metadata()
      const width = Math.min(meta.width || 2560, 2560)
      await img
        .resize({ width, fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(heroWebp)
      const stat = fs.statSync(heroWebp)
      const kb = Math.round(stat.size / 1024)
      console.log(`✔ hero-image.png → hero-image.webp (${kb} KB)`)
    } else {
      console.log('No hero-image.png found in public; skipping hero WebP conversion.')
    }
  } catch (e) {
    console.error('✘ Failed to convert homepage hero:', e.message)
  }

  const files = fs.readdirSync(dir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))

  if (!files.length) {
    console.log('No PNG/JPG images found in Featured hero directory.')
    return
  }

  console.log(`Found ${files.length} images. Converting to WebP...`)

  let converted = 0
  for (const f of files) {
    const srcPath = path.join(dir, f)
    const outPath = path.join(dir, f.replace(/\.(png|jpg|jpeg)$/i, '.webp'))
    try {
      const img = sharp(srcPath)
      const meta = await img.metadata()
      // Keep original dimensions; set a balanced quality
      await img
        .resize({ width: meta.width, height: meta.height, fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(outPath)
      converted++
      const stat = fs.statSync(outPath)
      const kb = Math.round(stat.size / 1024)
      console.log(`✔ ${f} → ${path.basename(outPath)} (${kb} KB)`) 
    } catch (e) {
      console.error(`✘ Failed to convert ${f}:`, e.message)
    }
  }

  console.log(`Done. Converted: ${converted}/${files.length}`)
}

main().catch(e => {
  console.error('Optimization failed:', e)
  process.exit(1)
})
