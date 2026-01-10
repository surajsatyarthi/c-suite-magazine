import Image, { ImageProps } from 'next/image'
import { memo } from 'react'

const DEFAULT_BLUR_DATA_URL = 'data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjZmN2Y4IiBvZmZzZXQ9IjIwJSIvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZWRlZWYxIiBvZmZzZXQ9IjUwJSIvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjZmN2Y4IiBvZmZzZXQ9IjcwJSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9IiNmNmY3ZjgiLz4KICA8cmVjdCBpZD0iciIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9InVybCgjZykiLz4KICA8YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTcwMCIgdG89IjcwMCIgZHVyPSIxLjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg=='

function shimmer(w: number, h: number) {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
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
  )}`
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

  const w = typeof width === 'number' ? width : 700
  const h = typeof height === 'number' ? height : 475

  const useBlurDataURL = blurDataURL || (w === 700 && h === 475 ? DEFAULT_BLUR_DATA_URL : shimmer(w, h))

  // Enhanced image optimization for CXO quality
  const effectiveQuality = highQuality || hero ? 95 : quality

  // Prefer WebP for better compression and quality
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
