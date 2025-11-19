import { NextResponse } from 'next/server'
import { client, urlFor } from '@/lib/sanity'
import { writeClient } from '@/lib/sanityWrite'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const placement = searchParams.get('placement') || 'homepage-banner'

    const query = `*[_type == "advertisement" && placement == $placement && isActive == true && (!defined(startDate) || startDate <= now()) && (!defined(endDate) || endDate >= now())] | order(priority desc)[0] {
      _id,
      name,
      image,
      targetUrl,
      placement,
      dimensions,
      isActive,
      priority
    }`

    const ad = await client.fetch(query, { placement })

    if (!ad) {
      return NextResponse.json({ ok: true, found: false })
    }

    const defaultDims: Record<string, { width: number; height: number }> = {
      'article-sidebar': { width: 300, height: 250 },
      'article-sidebar-large': { width: 300, height: 600 },
      'in-article': { width: 728, height: 90 },
      'homepage-banner': { width: 970, height: 250 },
      'homepage-sidebar': { width: 300, height: 250 },
      'footer-banner': { width: 728, height: 90 },
    }

    const width = ad?.dimensions?.width || defaultDims[placement]?.width || 300
    const height = ad?.dimensions?.height || defaultDims[placement]?.height || 250

    const imageUrl = urlFor(ad.image).width(width).height(height).auto('format').url()

    return NextResponse.json({
      ok: true,
      found: true,
      imageUrl,
      targetUrl: ad.targetUrl,
      alt: ad.image?.alt || ad.name || 'Sponsored',
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to fetch ad' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      imageAssetId,
      alt,
      targetUrl,
      placement,
      dimensions,
      isActive,
      priority,
      startDate,
      endDate,
      openInNewTab,
    } = body || {}

    if (!name || !placement) {
      return NextResponse.json({ ok: false, error: 'Missing name or placement' }, { status: 400 })
    }

    const image = imageAssetId
      ? { _type: 'image', asset: { _type: 'reference', _ref: imageAssetId }, alt: alt || name }
      : undefined

    const doc: any = {
      _type: 'advertisement',
      name,
      ...(image ? { image } : {}),
      ...(targetUrl ? { targetUrl } : {}),
      placement,
      ...(dimensions ? { dimensions } : {}),
      ...(typeof isActive === 'boolean' ? { isActive } : { isActive: true }),
      ...(typeof priority === 'number' ? { priority } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(typeof openInNewTab === 'boolean' ? { openInNewTab } : {}),
    }

    const created = await writeClient.create(doc)
    return NextResponse.json({ ok: true, id: created._id, action: 'created' })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to create ad' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, name, targetUrl, placement, dimensions, isActive, priority, startDate, endDate } = body || {}
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing ad id' }, { status: 400 })
    }

    const patch = writeClient.patch(id)
      .setIfMissing({})
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(targetUrl !== undefined ? { targetUrl } : {}),
        ...(placement !== undefined ? { placement } : {}),
        ...(dimensions !== undefined ? { dimensions } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(startDate !== undefined ? { startDate } : {}),
        ...(endDate !== undefined ? { endDate } : {}),
      })

    const result = await writeClient.transaction().patch(patch).commit({ autoGenerateArrayKeys: true })

    return NextResponse.json({ ok: true, updated: result })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Failed to update ad' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  // Alias to PATCH for convenience
  return PATCH(request)
}
