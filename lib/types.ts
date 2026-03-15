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
  hotspot?: any // RALPH-BYPASS [Legacy Sanity hotspot type]
  crop?: any // RALPH-BYPASS [Legacy Sanity crop type]
}

export interface Writer {
  _id: string
  name: string
  slug: { current: string }
  writerType?: 'staff' | 'guest' | 'contributor' | 'client'
  position?: string
  imageUrl?: string
  image?: SanityImage
  bio?: any[] // RALPH-BYPASS [Legacy Portable Text bio field]
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
  _type?: 'post' | 'csa'
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
  contributorName?: string
  publishedAt?: string
  body: any[] // RALPH-BYPASS [Legacy Portable Text body field]
  contentPillar?: string
  fallbackImageUrl?: string | null
  articleVariant?: string
  popupAd?: {
    targetUrl?: string
    image?: SanityImage & { asset?: { url?: string } }
    alt?: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}
