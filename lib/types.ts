export interface Author {
  _id: string
  name: string
  slug: { current: string }
  position?: string
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
  author: Author
  mainImage: any
  categories: Category[]
  isFeatured?: boolean
  readTime?: number
  publishedAt: string
  body: any[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}
