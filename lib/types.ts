export interface SanityImage {
  asset: {
    _ref: string
    _type: string
    url?: string
    metadata?: {
      dimensions?: {
        width: number
        height: number
        aspectRatio: number
      }
    }
  }
  alt?: string
  hotspot?: any
  crop?: any
}

export interface Writer {
  _id: string
  name: string
  slug: { current: string }
  position?: string
  imageUrl?: string
  image?: SanityImage
  bio?: any[]
  social?: {
    email?: string
    showEmail?: boolean
    twitter?: string
    linkedin?: string
    website?: string
  }
  articles?: Post[]
}

export interface Category {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  color?: string
}

export interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  excerptText?: string
  writer?: Writer
  mainImage?: SanityImage
  categories: Category[]
  tags?: string[]
  isFeatured?: boolean
  readTime?: number
  heroTagline?: string
  views?: number
  hideViews?: boolean
  publishedAt?: string
  body: any[]
  contentPillar?: string
  articleVariant?: string
  popupAd?: {
    targetUrl?: string
    image?: SanityImage
    alt?: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}
