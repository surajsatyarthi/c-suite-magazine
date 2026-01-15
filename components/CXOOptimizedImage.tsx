import Image, { ImageProps } from 'next/image'
import { memo } from 'react'

function shimmer(w: number, h: number) {
  // Use btoa instead of Buffer to avoid Node.js polyfills in client bundles
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g">
        <stop stop-color="#f6f7f8" offset="20%"/>
        <stop stop-color="#edeef1" offset="50%"/>
        <stop stop-color="#f6f7f8" offset="70%"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="#f6f7f8"/>
    <rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
  </svg>`

  return `data:image/svg+xml;base64,${typeof window === 'undefined' ? Buffer.from(svg).toString('base64') : window.btoa(svg)}`
}

type CXOImageProps = Omit<ImageProps, 'loader'> & {
  quality?: number
  priority?: boolean
  highQuality?: boolean
  hero?: boolean
}

const CXOOptimizedImage = memo(function CXOOptimizedImage({
  alt,
  quality = 95, // Higher quality for CXO audience
  sizes,
  placeholder,
  blurDataURL,
  priority = false,
  highQuality = false,
  hero = false,
  width,
  height,
  ...rest
}: CXOImageProps) {
  // Enhanced responsive sizing for different screen sizes
  const heroSizes = '(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 85vw, (max-width: 1280px) 80vw, 75vw'
  const standardSizes = '(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 60vw'
  
  const defaultSizes = hero ? heroSizes : standardSizes

  // Default placeholder shimmer when none provided
  const usePlaceholder = placeholder || 'blur'
  const useBlurDataURL = blurDataURL || shimmer(
    typeof width === 'number' ? width : 700,
    typeof height === 'number' ? height : 475
  )

  // Enhanced image optimization for CXO quality
  const effectiveQuality = highQuality || hero ? 95 : quality

  // Prefer WebP for better compression and quality
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let effectiveSrc: any = (rest as any).src
  if (typeof effectiveSrc === 'string') {
    const isFeaturedHero = effectiveSrc.startsWith('/Featured hero/') || effectiveSrc.startsWith('/Featured section/')
    const isPngOrJpg = /\.(png|jpg|jpeg)$/i.test(effectiveSrc)
    if (isFeaturedHero && isPngOrJpg) {
      effectiveSrc = effectiveSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    }
  }

  // Force priority loading for hero images
  const effectivePriority = hero || priority

  return (
    <Image
      alt={alt}
      quality={effectiveQuality}
      sizes={sizes || defaultSizes}
      placeholder={usePlaceholder}
      blurDataURL={useBlurDataURL}
      priority={effectivePriority}
      width={width}
      height={height}
      {...rest}
      src={effectiveSrc}
    />
  )
})

export default CXOOptimizedImage