/**
 * Automated Duplicate Image Analysis and Fix Script
 * Runs comprehensive analysis and auto-fixes safe duplicates
 */

import { articleImageService } from '@/lib/articleImageService'

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

async function runAutomatedAnalysis() {
  console.log('🚀 Starting automated duplicate image analysis...')
  
  try {
    // Step 1: Run comprehensive analysis
    console.log('📊 Running comprehensive duplicate analysis...')
    const analysisResponse = await fetch('http://localhost:3000/api/articles/flag-duplicates')
    const analysisData: AnalysisResult = await analysisResponse.json()
    
    console.log('📈 Analysis Complete:')
    console.log(`   Total Articles: ${analysisData.stats.totalArticles}`)
    console.log(`   Articles with Images: ${analysisData.stats.articlesWithImages}`)
    console.log(`   Unique Images: ${analysisData.stats.uniqueImages}`)
    console.log(`   Total Duplicates: ${analysisData.stats.totalDuplicates}`)
    console.log(`   Articles Flagged: ${analysisData.stats.articlesFlagged}`)
    console.log(`   Articles Can Auto-Fix: ${analysisData.stats.articlesCanAutoFix}`)
    
    // Step 2: Identify safe-to-fix articles (non-spotlight only)
    const safeToFixArticles = analysisData.flaggedArticles.filter(article => 
      article.canAutoFix && article.flagStatus === 'duplicate'
    )
    
    console.log(`🎯 Found ${safeToFixArticles.length} articles safe to auto-fix`)
    
    if (safeToFixArticles.length === 0) {
      console.log('✅ No safe duplicates found to fix')
      return
    }
    
    // Step 3: Auto-fix safe duplicates
    console.log('🔧 Auto-fixing safe duplicates...')
    const articleIdsToFix = safeToFixArticles.map(article => article._id)
    
    const fixResponse = await fetch('http://localhost:3000/api/articles/fix-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleIds: articleIdsToFix })
    })
    
    const fixData = await fixResponse.json()
    
    // Step 4: Report results
    console.log('📋 Fix Results:')
    fixData.results.forEach((result: any) => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'skipped' ? '⚠️' : '❌'
      console.log(`   ${status} ${result.articleId}: ${result.status}`)
      if (result.newImageUrl) {
        console.log(`      New image generated: ${result.method}`)
      }
      if (result.reason) {
        console.log(`      Reason: ${result.reason}`)
      }
    })
    
    // Step 5: Re-run analysis to verify fixes
    console.log('🔍 Re-running analysis to verify fixes...')
    const finalResponse = await fetch('http://localhost:3000/api/articles/flag-duplicates')
    const finalData: AnalysisResult = await finalResponse.json()
    
    console.log('📊 Final Results:')
    console.log(`   Remaining Duplicates: ${finalData.stats.totalDuplicates}`)
    console.log(`   Remaining Flagged Articles: ${finalData.stats.articlesFlagged}`)
    console.log(`   Remaining Auto-Fixable: ${finalData.stats.articlesCanAutoFix}`)
    
    // Step 6: Report critical issues (cannot auto-fix)
    const criticalIssues = finalData.flaggedArticles.filter(article => 
      article.flagStatus === 'critical' || article.flagStatus === 'warning'
    )
    
    if (criticalIssues.length > 0) {
      console.log('🚨 Critical Issues Requiring Manual Review:')
      criticalIssues.forEach(article => {
        console.log(`   ⚠️  ${article.title} (${article._id})`)
        console.log(`      Status: ${article.flagStatus.toUpperCase()}`)
        console.log(`      Reason: ${article.flagReason}`)
        if (article.sharingWith.length > 0) {
          console.log(`      Sharing with: ${article.sharingWith.map((a: any) => a.title).join(', ')}`)
        }
      })
    }
    
    console.log('🎉 Automated analysis and fix complete!')
    console.log('📍 Access admin dashboard at: http://localhost:3000/admin')
    
  } catch (error) {
    console.error('❌ Automated analysis failed:', error)
    console.error('Details:', error instanceof Error ? error.message : 'Unknown error')
  }
}

// Run the automated analysis
console.log('🤖 Starting automated duplicate image analysis and fix...')
runAutomatedAnalysis()
  .then(() => {
    console.log('✅ Process completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Process failed:', error)
    process.exit(1)
  })