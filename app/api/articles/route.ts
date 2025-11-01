import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityWrite'

type ArticlePayload = {
  id?: string
  title?: string
  slug?: string
  excerpt?: string
  authorId?: string
  authorSlug?: string
  categoryIds?: string[]
  categorySlugs?: string[]
  mainImageAssetId?: string
  mainImageAlt?: string
  mainImageCaption?: string
  isFeatured?: boolean
  body?: any
  seo?: { metaTitle?: string; metaDescription?: string }
  readTime?: number
  publishedAt?: string
}

async function resolveAuthorRef(payload: ArticlePayload) {
  if (payload.authorId) return { _type: 'reference', _ref: payload.authorId }
  if (payload.authorSlug) {
    const author = await writeClient.fetch(`*[_type == "author" && slug.current == $slug][0]{_id}`, {
      slug: payload.authorSlug,
    })
    if (author?._id) return { _type: 'reference', _ref: author._id }
  }
  return undefined
}

async function resolveCategoryRefs(payload: ArticlePayload) {
  if (payload.categoryIds?.length) {
    return payload.categoryIds.map((id) => ({ _type: 'reference', _ref: id }))
  }
  if (payload.categorySlugs?.length) {
    const cats = await writeClient.fetch(
      `*[_type == "category" && slug.current in $slugs]{ _id, slug }`,
      { slugs: payload.categorySlugs }
    )
    return (cats || []).map((c: any) => ({ _type: 'reference', _ref: c._id }))
  }
  return undefined
}

function buildMainImage(payload: ArticlePayload) {
  if (!payload.mainImageAssetId) return undefined
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: payload.mainImageAssetId },
    alt: payload.mainImageAlt || '',
    caption: payload.mainImageCaption || undefined,
  }
}

async function upsertArticle(payload: ArticlePayload) {
  const authorRef = await resolveAuthorRef(payload)
  const categoryRefs = await resolveCategoryRefs(payload)
  const mainImage = buildMainImage(payload)

  const baseDoc: any = {
    _type: 'post',
    ...(payload.title ? { title: payload.title } : {}),
    ...(payload.slug ? { slug: { current: payload.slug } } : {}),
    ...(payload.excerpt ? { excerpt: payload.excerpt } : {}),
    ...(authorRef ? { author: authorRef } : {}),
    ...(categoryRefs ? { categories: categoryRefs } : {}),
    ...(mainImage ? { mainImage } : {}),
    ...(typeof payload.isFeatured === 'boolean' ? { isFeatured: payload.isFeatured } : {}),
    ...(payload.body ? { body: payload.body } : {}),
    ...(payload.readTime ? { readTime: payload.readTime } : {}),
    ...(payload.publishedAt ? { publishedAt: payload.publishedAt } : {}),
    ...(payload.seo?.metaTitle ? { metaTitle: payload.seo.metaTitle } : {}),
    ...(payload.seo?.metaDescription ? { metaDescription: payload.seo.metaDescription } : {}),
  }

  // If ID provided, patch existing
  if (payload.id) {
    const result = await writeClient.patch(payload.id).set(baseDoc).commit()
    return { id: result._id, action: 'updated' }
  }

  // If slug maps to existing doc, update; else create
  if (payload.slug) {
    const existing = await writeClient.fetch(
      `*[_type == "post" && slug.current == $slug][0]{ _id }`,
      { slug: payload.slug }
    )
    if (existing?._id) {
      const result = await writeClient.patch(existing._id).set(baseDoc).commit()
      return { id: result._id, action: 'updated' }
    } else {
      const result = await writeClient.create({ ...baseDoc })
      return { id: result._id, action: 'created' }
    }
  }

  // Fallback: create new document (requires title at least)
  const result = await writeClient.create({ ...baseDoc })
  return { id: result._id, action: 'created' }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ArticlePayload
    if (!payload || (!payload.title && !payload.slug && !payload.id)) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }
    const result = await upsertArticle(payload)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to upsert article' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as ArticlePayload
    if (!payload || (!payload.id && !payload.slug)) {
      return NextResponse.json({ ok: false, error: 'Provide id or slug for update' }, { status: 400 })
    }
    const result = await upsertArticle(payload)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to update article' }, { status: 500 })
  }
}

