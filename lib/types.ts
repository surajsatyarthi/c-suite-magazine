export interface Writer {
  _id: string
  name: string
  slug: { current: string }
  position?: string
  imageUrl?: string
  image: any
  bio?: any[]
  social?: {
    twitter?: string
    linkedin?: string
    website?: string
  }
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
  writer?: Writer
  mainImage: any
  categories: Category[]
  tags?: string[]
  isFeatured?: boolean
  readTime?: number
  publishedAt: string
  views?: number
  body: any[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}
