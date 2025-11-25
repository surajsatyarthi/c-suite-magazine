/**
 * Webhook handler for Sanity CMS article creation
 * Automatically generates unique images for new non-spotlight articles
 */

import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { _id, _type, articleType } = payload

    // Only process post creations (align with schema)
    if (_type !== 'post') {
      return NextResponse.json({ status: 'ignored', reason: 'Not a post' })
    }

    // Skip spotlight articles (business rule)
    if (articleType === 'spotlight') {
      return NextResponse.json({ 
        status: 'skipped', 
        reason: 'Spotlight article - no automated image generation' 
      })
    }

    // Fetch complete article data
    const article = await client.fetch(
      `*[_id == $id][0]{ _id, title, excerpt, articleType, mainImage{asset->{_id,url}} }`,
      { id: _id }
    )

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // No-op: image generation disabled to avoid invalid asset refs. Keep webhook healthy.
    return NextResponse.json({ status: 'ignored', reason: 'Image generation disabled' })

  } catch (error) {
    console.error('Article webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    )
  }
}
