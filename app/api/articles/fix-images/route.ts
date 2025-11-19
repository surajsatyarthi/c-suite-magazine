import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { articleImageService } from '@/lib/articleImageService'

/**
 * API endpoint to fix duplicate images in articles
 * Automatically generates unique images for non-spotlight articles
 */
export async function POST(request: NextRequest) {
  try {
    const { articleIds } = await request.json()
    
    if (!articleIds || !Array.isArray(articleIds)) {
      return NextResponse.json(
        { error: 'articleIds array required' },
        { status: 400 }
      )
    }

    // Fetch articles with their current images
    const articles = await client.fetch(`
      *[_id in $articleIds] {
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
    `, { articleIds })

    const results = []
    
    for (const article of articles) {
      // Skip spotlight articles (business rule)
      if (article.articleType === 'spotlight') {
        results.push({
          articleId: article._id,
          status: 'skipped',
          reason: 'Spotlight article - image preserved'
        })
        continue
      }

      try {
        // Generate unique image for non-spotlight articles
        const newImageUrl = await articleImageService.generateUniqueImage(article)
        
        if (newImageUrl) {
          // Update article with new image in Sanity
          await client
            .patch(article._id)
            .set({
              featuredImage: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                },
                // Store the generated URL for reference
                generatedUrl: newImageUrl
              }
            })
            .commit()

          results.push({
            articleId: article._id,
            status: 'success',
            newImageUrl,
            method: 'generated'
          })
        } else {
          results.push({
            articleId: article._id,
            status: 'no_change',
            reason: 'Already has unique image'
          })
        }
      } catch (error) {
        console.error(`Failed to process article ${article._id}:`, error)
        results.push({
          articleId: article._id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    })

  } catch (error) {
    console.error('Image fix API error:', error)
    return NextResponse.json(
      { error: 'Failed to process image fixes' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to analyze duplicate images
 */
export async function GET() {
  try {
    // Fetch all non-spotlight articles with their images
    const articles = await client.fetch(`
      *[_type == "article" && articleType != "spotlight"] {
        _id,
        title,
        featuredImage{
          asset->{
            _id,
            url
          }
        }
      }
    `)

    // Group articles by image asset ID to find duplicates
    const imageGroups = articles.reduce((groups: Record<string, any[]>, article: any) => {
      const imageId = article.featuredImage?.asset?._id
      if (imageId) {
        if (!groups[imageId]) {
          groups[imageId] = []
        }
        groups[imageId].push(article)
      }
      return groups
    }, {})

    // Find images used by multiple articles
    const duplicates = Object.entries(imageGroups)
      .filter(([_, articles]) => (articles as any[]).length > 1)
      .map(([imageId, articles]) => ({
        imageId,
        articleCount: (articles as any[]).length,
        articles: (articles as any[]).map(a => ({ _id: a._id, title: a.title }))
      }))

    return NextResponse.json({
      totalArticles: articles.length,
      uniqueImages: Object.keys(imageGroups).length,
      duplicates,
      duplicateCount: duplicates.length
    })

  } catch (error) {
    console.error('Duplicate analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze duplicates' },
      { status: 500 }
    )
  }
}