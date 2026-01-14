import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import { writeClient } from '@/lib/sanityWrite'
import { validateWriteRequest, validateImageUpload } from '@/lib/security'

type ImageUploadPayload = {
  imageUrl?: string
  filename?: string
  alt?: string
  base64?: string
}

async function fetchImageStream(url: string): Promise<{ stream: Readable; contentType: string | null }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const stream = Readable.from(buffer)
  const contentType = res.headers.get('content-type')
  return { stream, contentType }
}

export async function POST(request: NextRequest) {
  try {
    // Basic security validation for image uploads
    const { valid, error } = await validateWriteRequest(request, {
      requireReferer: true,
      allowedContentTypes: ['multipart/form-data', 'application/json']
    })
    
    if (!valid && error) return error
    
    const contentTypeHeader = request.headers.get('content-type') || ''
    // Multipart form-data upload path (preferred when sending files)
    if (contentTypeHeader.startsWith('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file') as File | null
      const alt = (form.get('alt') as string) || ''
      const filename = (form.get('filename') as string) || (file?.name || 'upload.jpg')
      if (!file) {
        return NextResponse.json({ ok: false, error: 'Missing file' }, { status: 400 })
      }
      
      // Validate image file
      const validation = validateImageUpload(file)
      if (!validation.valid) {
        return NextResponse.json({ ok: false, error: validation.error }, { status: 400 })
      }
      
      const asset = await writeClient.assets.upload('image', file, { filename, contentType: file.type || 'image/jpeg' })
      const imageField = {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt,
      }
      return NextResponse.json({ ok: true, assetId: asset._id, image: imageField })
    }

    // JSON payload path (imageUrl or base64)
    const payload = (await request.json()) as ImageUploadPayload
    if (!payload?.imageUrl && !payload?.base64) {
      return NextResponse.json({ ok: false, error: 'Provide imageUrl or base64' }, { status: 400 })
    }

    let stream: Readable
    let contentType: string | null = null
    if (payload.base64) {
      const commaIdx = payload.base64.indexOf(',')
      const header = commaIdx > -1 ? payload.base64.substring(0, commaIdx) : ''
      const mimeMatch = header.match(/data:(.*);base64/)
      contentType = mimeMatch?.[1] || 'image/jpeg'
      const b64 = commaIdx > -1 ? payload.base64.substring(commaIdx + 1) : payload.base64
      const buffer = Buffer.from(b64, 'base64')
      stream = Readable.from(buffer)
    } else {
      const fetched = await fetchImageStream(payload.imageUrl!)
      stream = fetched.stream
      contentType = fetched.contentType
    }
    const filename = payload.filename || 'upload.jpg'

    const asset = await writeClient.assets.upload('image', stream, { filename, contentType: contentType || 'image/jpeg' })

    // Return usable image field stub
    const imageField = {
      _type: 'image',
      asset: { _type: 'reference', _ref: asset._id },
      alt: payload.alt || '',
    }

    return NextResponse.json({ ok: true, assetId: asset._id, image: imageField })
  } catch (e) {
    console.error('[api/images] Image upload failed:', e)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = (e as any)?.message || 'Image upload failed'
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
