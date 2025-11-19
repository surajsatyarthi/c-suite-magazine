/**
 * Direct Database Analysis Script
 * Analyzes all articles directly through Sanity client
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

interface AnalysisResult {
  stats: {
    totalArticles: number
    articlesWithImages: number
    uniqueImages: number
    totalDuplicates: number
    criticalDuplicates: number
    spotlightOnlyDuplicates: number
    regularDuplicates: number
    articlesFlagged: number
    articlesCanAutoFix: number
  }
  flaggedArticles: any[]
  duplicateGroups: any[]
  criticalDuplicates: any[]
}

async function runDirectAnalysis() {
  console.log('🚀 Starting direct database analysis...')
  
  try {
    // Step 1: Fetch all articles with images
    console.log('📊 Fetching all articles...')
    const articles = await sanityClient.fetch(`
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

    console.log(`📋 Found ${articles.length} total articles`)

    // Step 2: Group by image asset ID
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

    // Step 3: Identify duplicates
    const duplicates = Object.values(imageGroups)
      .filter((group: any) => group.count > 1)
      .sort((a: any, b: any) => b.count - a.count)

    // Step 4: Categorize duplicates
    const criticalDuplicates = duplicates.filter((g: any) => g.spotlightCount > 0 && g.regularCount > 0)
    const spotlightOnlyDuplicates = duplicates.filter((g: any) => g.spotlightCount > 1 && g.regularCount === 0)
    const regularDuplicates = duplicates.filter((g: any) => g.spotlightCount === 0 && g.regularCount > 1)

    // Step 5: Flag individual articles
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
          canAutoFix = false
        } else if (group.spotlightCount > 0) {
          flagStatus = 'critical'
          flagReason = 'Regular article sharing image with spotlight articles'
          canAutoFix = false
        } else {
          flagStatus = 'duplicate'
          flagReason = 'Sharing image with other regular articles'
          canAutoFix = true
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

    // Step 6: Generate statistics
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

    // Step 7: Report findings
    console.log('\n📊 COMPREHENSIVE DUPLICATE IMAGE ANALYSIS')
    console.log('=' .repeat(50))
    
    console.log('\n📈 STATISTICS:')
    console.log(`   Total Articles: ${stats.totalArticles}`)
    console.log(`   Articles with Images: ${stats.articlesWithImages}`)
    console.log(`   Unique Images: ${stats.uniqueImages}`)
    console.log(`   Total Duplicate Groups: ${stats.totalDuplicates}`)
    console.log(`   Articles Flagged: ${stats.articlesFlagged}`)
    console.log(`   Articles Can Auto-Fix: ${stats.articlesCanAutoFix}`)

    console.log('\n🚨 DUPLICATE BREAKDOWN:')
    console.log(`   Critical (Mixed Types): ${stats.criticalDuplicates}`)
    console.log(`   Spotlight Only: ${stats.spotlightOnlyDuplicates}`)
    console.log(`   Regular Only: ${stats.regularDuplicates}`)

    // Step 8: Detailed duplicate groups
    if (duplicates.length > 0) {
      console.log('\n🔍 TOP DUPLICATE GROUPS:')
      duplicates.slice(0, 10).forEach((group: any, index) => {
        console.log(`\n   ${index + 1}. Image used by ${group.count} articles:`)
        console.log(`      Spotlight: ${group.spotlightCount}, Regular: ${group.regularCount}`)
        console.log(`      Articles:`)
        group.articles.forEach((article: any) => {
          const type = article.articleType === 'spotlight' ? '⭐' : '📄'
          console.log(`        ${type} ${article.title}`)
        })
      })
    }

    // Step 9: Critical issues requiring attention
    const criticalIssues = flaggedArticles.filter((article: any) => 
      article.flagStatus === 'critical' || article.flagStatus === 'warning'
    )

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES REQUIRING MANUAL REVIEW:')
      criticalIssues.forEach((article: any) => {
        const icon = article.flagStatus === 'critical' ? '🚨' : '⚠️'
        console.log(`\n   ${icon} ${article.title}`)
        console.log(`      Status: ${article.flagStatus.toUpperCase()}`)
        console.log(`      Reason: ${article.flagReason}`)
        if (article.sharingWith.length > 0) {
          console.log(`      Sharing with: ${article.sharingWith.map((a: any) => a.title).join(', ')}`)
        }
      })
    }

    // Step 10: Auto-fixable articles
    const autoFixable = flaggedArticles.filter((article: any) => article.canAutoFix)
    if (autoFixable.length > 0) {
      console.log('\n🔧 AUTO-FIXABLE ARTICLES:')
      autoFixable.forEach((article: any) => {
        console.log(`   📄 ${article.title}`)
        console.log(`      Sharing with ${article.duplicateCount - 1} other articles`)
      })
    }

    console.log('\n✅ Analysis complete!')
    console.log('\n📍 Next steps:')
    console.log('   1. Review critical issues above')
    console.log('   2. Access admin dashboard: http://localhost:3000/admin')
    console.log('   3. Use Duplicate Flagger tool for detailed analysis')
    console.log('   4. Auto-fix safe duplicates in bulk')

    return {
      success: true,
      stats,
      flaggedArticles,
      duplicateGroups: duplicates,
      criticalDuplicates
    }

  } catch (error) {
    console.error('❌ Direct analysis failed:', error)
    console.error('Details:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// Run the direct analysis
console.log('🤖 Starting direct database analysis...')
runDirectAnalysis()
  .then((results) => {
    console.log('\n🎉 Direct analysis completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Direct analysis failed:', error)
    process.exit(1)
  })