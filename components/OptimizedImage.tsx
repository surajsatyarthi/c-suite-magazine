import Image, { ImageProps } from 'next/image'
import { memo } from 'react'

const DEFAULT_BLUR_DATA_URL = 'data:image/svg+xml;base64,Cjxzdmcgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjZmN2Y4IiBvZmZzZXQ9IjIwJSIvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZWRlZWYxIiBvZmZzZXQ9IjUwJSIvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjZjZmN2Y4IiBvZmZzZXQ9IjcwJSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9IiNmNmY3ZjgiLz4KICA8cmVjdCBpZD0iciIgd2lkdGg9IjcwMCIgaGVpZ2h0PSI0NzUiIGZpbGw9InVybCgjZykiLz4KICA8YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTcwMCIgdG89IjcwMCIgZHVyPSIxLjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgIC8+Cjwvc3ZnPg=='

type Props = Omit<ImageProps, 'loader'> & {
  quality?: number
}

const OptimizedImage = memo(function OptimizedImage({
  alt,
  quality = 75,
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
  const useBlurDataURL = blurDataURL || DEFAULT_BLUR_DATA_URL

  // Prefer WebP for local Featured hero assets
  let effectiveSrc: any = (rest as any).src
  if (typeof effectiveSrc === 'string') {
    const isFeaturedHero = effectiveSrc.startsWith('/Featured hero/')
    const isPngOrJpg = /\.(png|jpg|jpeg)$/i.test(effectiveSrc)
    if (isFeaturedHero && isPngOrJpg) {
      effectiveSrc = effectiveSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp')
    }
  }

  return (
    <Image
      alt={alt}
      quality={quality}
      sizes={defaultSizes}
      placeholder={usePlaceholder}
      blurDataURL={useBlurDataURL}
      priority={priority}
      {...rest}
      src={effectiveSrc}
    />
  )
})

export default OptimizedImage
