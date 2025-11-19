/*
  Generate multi-size favicon.ico and Apple touch icon from app/icon.svg
  - Outputs:
    - app/favicon.ico (16, 32, 48, 64)
    - public/apple-touch-icon.png (180x180)
*/
const fs = require('fs/promises')
const path = require('path')
const { Resvg } = require('@resvg/resvg-js')
const pngToIcoModule = require('png-to-ico')
const pngToIco = pngToIcoModule.default || pngToIcoModule

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function main() {
  const root = process.cwd()
  const svgPath = path.join(root, 'app', 'icon.svg')
  const outIco = path.join(root, 'app', 'favicon.ico')
  const outApple = path.join(root, 'public', 'apple-touch-icon.png')
  const tmpDir = path.join(root, '.tmp-icons')

  try {
    await ensureDir(tmpDir)
    const svg = await fs.readFile(svgPath, 'utf8')
    const sizes = [16, 32, 48, 64]

    // Render PNGs from SVG for all favicon sizes
    const pngPaths = []
    for (const size of sizes) {
      const pngPath = path.join(tmpDir, `icon-${size}.png`)
      const scale = size / 24 // viewBox is 24
      const r = new Resvg(svg, { fitTo: { mode: 'zoom', value: scale }, background: 'rgba(0,0,0,0)' })
      const png = r.render().asPng()
      await fs.writeFile(pngPath, png)
      pngPaths.push(pngPath)
    }

    // Generate ICO from PNGs
    const icoBuf = await pngToIco(pngPaths)
    await fs.writeFile(outIco, icoBuf)

    // Generate Apple touch icon 180x180
    await ensureDir(path.dirname(outApple))
    const scale180 = 180 / 24
    const r180 = new Resvg(svg, { fitTo: { mode: 'zoom', value: scale180 }, background: 'rgba(0,0,0,0)' })
    const png180 = r180.render().asPng()
    await fs.writeFile(outApple, png180)

    // Cleanup tmp
    for (const p of pngPaths) {
      await fs.unlink(p).catch(() => {})
    }
    await fs.rmdir(tmpDir).catch(() => {})

    console.log('Generated:', outIco)
    console.log('Generated:', outApple)
  } catch (err) {
    console.error('Icon generation failed:', err)
    process.exit(1)
  }
}

main()
