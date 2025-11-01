import { NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityWrite'

type AuthorPayload = {
  id?: string
  name?: string
  slug?: string
  position?: string
  bio?: any
  imageAssetId?: string
  twitter?: string
  linkedin?: string
  website?: string
}

function buildImage(payload: AuthorPayload) {
  if (!payload.imageAssetId) return undefined
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: payload.imageAssetId },
  }
}

async function upsertAuthor(payload: AuthorPayload) {
  const image = buildImage(payload)
  const baseDoc: any = {
    _type: 'author',
    ...(payload.name ? { name: payload.name } : {}),
    ...(payload.slug ? { slug: { current: payload.slug } } : {}),
    ...(payload.position ? { position: payload.position } : {}),
    ...(payload.bio ? { bio: payload.bio } : {}),
    ...(image ? { image } : {}),
    ...(payload.twitter || payload.linkedin || payload.website
      ? {
          social: {
            twitter: payload.twitter || undefined,
            linkedin: payload.linkedin || undefined,
            website: payload.website || undefined,
          },
        }
      : {}),
  }

  if (payload.id) {
    const result = await writeClient.patch(payload.id).set(baseDoc).commit()
    return { id: result._id, action: 'updated' }
  }

  if (payload.slug) {
    const existing = await writeClient.fetch(
      `*[_type == "author" && slug.current == $slug][0]{ _id }`,
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

  const result = await writeClient.create({ ...baseDoc })
  return { id: result._id, action: 'created' }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AuthorPayload
    if (!payload || (!payload.name && !payload.slug && !payload.id)) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }
    const result = await upsertAuthor(payload)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to upsert author' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as AuthorPayload
    if (!payload || (!payload.id && !payload.slug)) {
      return NextResponse.json({ ok: false, error: 'Provide id or slug for update' }, { status: 400 })
    }
    const result = await upsertAuthor(payload)
    return NextResponse.json({ ok: true, ...result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to update author' }, { status: 500 })
  }
}

