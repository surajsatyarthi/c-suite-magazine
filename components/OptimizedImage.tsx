'use client'

import Image, { ImageProps } from 'next/image'
import { memo } from 'react'

function shimmer(w: number, h: number) {
  return `data:image/svg+xml;base64,${Buffer.from(
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
  ).toString('base64')}`
}

type Props = Omit<ImageProps, 'loader'> & {
  quality?: number
}

const OptimizedImage = memo(function OptimizedImage({
  alt,
  quality = 90,
  sizes,
  placeholder,
  blurDataURL,
  priority,
  ...rest
}: Props) {
  // Improved responsive sizing with better breakpoints
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, (max-width: 1280px) 70vw, 60vw'

  // Default placeholder shimmer when none provided
  const usePlaceholder = placeholder || 'blur'
  const useBlurDataURL = blurDataURL || shimmer(700, 475)

  return (
    <Image
      alt={alt}
      quality={quality}
      sizes={defaultSizes}
      placeholder={usePlaceholder}
      blurDataURL={useBlurDataURL}
      priority={priority}
      {...rest}
    />
  )
})

export default OptimizedImage

