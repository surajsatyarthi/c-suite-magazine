/**
 * Webhook handler for Sanity CMS article creation
 * Automatically generates unique images for new non-spotlight articles
 */

import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { articleImageService } from '@/lib/articleImageService'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { _id, _type, articleType } = payload

    // Only process article creations
    if (_type !== 'article') {
      return NextResponse.json({ status: 'ignored', reason: 'Not an article' })
    }

    // Skip spotlight articles (business rule)
    if (articleType === 'spotlight') {
      return NextResponse.json({ 
        status: 'skipped', 
        reason: 'Spotlight article - no automated image generation' 
      })
    }

    // Fetch complete article data
    const article = await client.fetch(`
      *[_id == $id][0] {
        _id,
        title,
        excerpt,
        articleType,
        category->{
          title
        },
        featuredImage{
          asset->{
            _id,
            url
          }
        }
      }
    `, { id: _id })

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Generate unique image for new article
    const newImageUrl = await articleImageService.generateUniqueImage(article)
    
    if (newImageUrl) {
      // Update article with generated image
      await client
        .patch(_id)
        .set({
          featuredImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            },
            generatedUrl: newImageUrl,
            generatedAt: new Date().toISOString()
          }
        })
        .commit()

      return NextResponse.json({
        status: 'success',
        articleId: _id,
        imageUrl: newImageUrl,
        method: 'auto-generated'
      })
    }

    return NextResponse.json({
      status: 'no_change',
      reason: 'Article already has unique image'
    })

  } catch (error) {
    console.error('Article webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process article' },
      { status: 500 }
    )
  }
}