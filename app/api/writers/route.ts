import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/lib/sanityWrite'
import { validateWriteRequest } from '@/lib/security'

type WriterPayload = {
  id?: string
  name?: string
  slug?: string
  position?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bio?: any
  imageAssetId?: string
  twitter?: string
  linkedin?: string
  website?: string
}

function buildImage(payload: WriterPayload) {
  if (!payload.imageAssetId) return undefined
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: payload.imageAssetId },
  }
}

async function upsertWriter(payload: WriterPayload) {
  const image = buildImage(payload)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baseDoc: any = {
    _type: 'writer',
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
      `*[_type == "writer" && slug.current == $slug][0]{ _id }`,
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

export async function POST(request: NextRequest) {
  try {
    // Validate request with security checks
    const { isValid, error, payload: validatedPayload } = await validateWriteRequest(request, {
      requireReferer: true,
      validateContent: true,
      allowedContentTypes: ['application/json']
    })
    
    if (!isValid) return error!
    
    // Use the payload returned by validation since request.json() is consumed
    const payload = validatedPayload as WriterPayload

    if (!payload || (!payload.name && !payload.slug && !payload.id)) {
      return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }
    const result = await upsertWriter(payload)
    return NextResponse.json({ ok: true, ...result }, {
      headers: {
        'Link': '</api/writers>; rel="self"',
      }
    })
  } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json({ ok: false, error: 'Failed to upsert writer' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate request with security checks
    const { isValid, error, payload: validatedPayload } = await validateWriteRequest(request, {
      requireReferer: true,
      validateContent: true,
      allowedContentTypes: ['application/json']
    })
    
    if (!isValid) return error!

    // Use the payload returned by validation since request.json() is consumed
    const payload = validatedPayload as WriterPayload
    
    if (!payload || (!payload.id && !payload.slug)) {
      return NextResponse.json({ ok: false, error: 'Provide id or slug for update' }, { status: 400 })
    }
    const result = await upsertWriter(payload)
    return NextResponse.json({ ok: true, ...result }, {
      headers: {
        'Link': '</api/writers>; rel="self"',
      }
    })
  } catch (e) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json({ ok: false, error: 'Failed to update writer' }, { status: 500 })
  }
}
