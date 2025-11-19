import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

/**
 * Comprehensive duplicate image analysis for all articles
 * Returns detailed flagging of all duplicate images across the entire magazine
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch ALL articles with their featured images
    const articles = await client.fetch(`
      *[_type == "article"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        articleType,
        publishedAt,
        category->{
          title,
          slug
        },
        featuredImage{
          asset->{
            _id,
            url,
            metadata{
              dimensions{
                width,
                height
              }
            }
          }
        },
        excerpt
      }
    `)

    console.log(`Analyzing ${articles.length} total articles`)

    // Group articles by image asset ID
    const imageGroups = articles.reduce((groups: Record<string, any>, article: any) => {
      const imageId = article.featuredImage?.asset?._id
      if (imageId) {
        if (!groups[imageId]) {
          groups[imageId] = {
            imageId,
            imageUrl: article.featuredImage.asset.url,
            dimensions: article.featuredImage.asset.metadata?.dimensions,
            articles: [],
            count: 0,
            spotlightCount: 0,
            regularCount: 0
          }
        }
        
        groups[imageId].articles.push({
          _id: article._id,
          title: article.title,
          slug: article.slug?.current,
          articleType: article.articleType,
          publishedAt: article.publishedAt,
          category: article.category?.title,
          excerpt: article.excerpt
        })
        
        groups[imageId].count++
        
        if (article.articleType === 'spotlight') {
          groups[imageId].spotlightCount++
        } else {
          groups[imageId].regularCount++
        }
      }
      
      return groups
    }, {})

    // Identify duplicates (images used by multiple articles)
    const duplicates = Object.values(imageGroups)
      .filter((group: any) => group.count > 1)
      .sort((a: any, b: any) => b.count - a.count) // Sort by most used first

    // Categorize by severity and type
    const criticalDuplicates = duplicates.filter((g: any) => g.spotlightCount > 0 && g.regularCount > 0)
    const spotlightOnlyDuplicates = duplicates.filter((g: any) => g.spotlightCount > 1 && g.regularCount === 0)
    const regularDuplicates = duplicates.filter((g: any) => g.spotlightCount === 0 && g.regularCount > 1)

    // Create detailed article-level flagging
    const flaggedArticles = articles.map((article: any) => {
      const imageId = article.featuredImage?.asset?._id
      const group = imageGroups[imageId]
      
      let flagStatus = 'unique'
      let flagReason = ''
      let canAutoFix = false
      
      if (group && group.count > 1) {
        if (article.articleType === 'spotlight') {
          flagStatus = 'warning'
          flagReason = 'Spotlight article sharing image with other articles'
          canAutoFix = false // Never auto-fix spotlight articles
        } else if (group.spotlightCount > 0) {
          flagStatus = 'critical'
          flagReason = 'Regular article sharing image with spotlight articles'
          canAutoFix = false // Don't auto-fix if spotlight articles involved
        } else {
          flagStatus = 'duplicate'
          flagReason = 'Sharing image with other regular articles'
          canAutoFix = true // Safe to auto-fix regular articles
        }
      }
      
      return {
        _id: article._id,
        title: article.title,
        slug: article.slug?.current,
        articleType: article.articleType,
        publishedAt: article.publishedAt,
        category: article.category?.title,
        imageId,
        imageUrl: article.featuredImage?.asset?.url,
        flagStatus,
        flagReason,
        canAutoFix,
        duplicateCount: group?.count || 1,
        sharingWith: group?.articles
          .filter((a: any) => a._id !== article._id)
          .map((a: any) => ({ _id: a._id, title: a.title, articleType: a.articleType })) || []
      }
    })

    // Summary statistics
    const stats = {
      totalArticles: articles.length,
      articlesWithImages: articles.filter((a: any) => a.featuredImage?.asset?._id).length,
      uniqueImages: Object.keys(imageGroups).length,
      totalDuplicates: duplicates.length,
      criticalDuplicates: criticalDuplicates.length,
      spotlightOnlyDuplicates: spotlightOnlyDuplicates.length,
      regularDuplicates: regularDuplicates.length,
      articlesFlagged: flaggedArticles.filter((a: any) => a.flagStatus !== 'unique').length,
      articlesCanAutoFix: flaggedArticles.filter((a: any) => a.canAutoFix).length
    }

    return NextResponse.json({
      success: true,
      stats,
      flaggedArticles,
      duplicateGroups: duplicates,
      criticalDuplicates,
      analysisTimestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Comprehensive duplicate analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze article images',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}