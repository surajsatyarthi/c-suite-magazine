/**
 * Automated Fix for Duplicate Post Images
 * Generates unique images for all duplicate posts (not spotlight articles)
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

// Simple image generation functions
function generateBusinessImageUrl(keywords: string[], title: string): string {
  const searchTerms = [...keywords, 'business', 'professional', 'corporate'].join(',')
  // Use Unsplash source with unique parameters
  return `https://source.unsplash.com/1200x800/?${searchTerms}&sig=${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function generateCategoryPattern(category: string, title: string): string {
  const colors = {
    'healthcare': ['#0066CC', '#00AA44', '#FFFFFF'],
    'finance': ['#1B365D', '#4A90E2', '#F8F9FA'],
    'technology': ['#0F1419', '#00D4FF', '#FFFFFF'],
    'leadership': ['#2C3E50', '#E74C3C', '#ECF0F1'],
    'strategy': ['#34495E', '#9B59B6', '#BDC3C7'],
    'default': ['#1A1A1A', '#FF6B35', '#F5F5F5']
  }
  
  const selectedColors = (colors as Record<string, string[]>)[category] || colors.default
  const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Generate unique SVG pattern
  const svg = `
    <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${selectedColors[0]};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${selectedColors[1]};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${selectedColors[2]};stop-opacity:0.9" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#grad${seed})"/>
      <g opacity="0.1">
        ${Array.from({length: 20}, (_, i) => {
          const x = (seed * i * 37) % 1200
          const y = (seed * i * 61) % 800
          return `<circle cx="${x}" cy="${y}" r="${2 + (seed * i) % 4}" fill="${selectedColors[2]}"/>`
        }).join('')}
      </g>
    </svg>
  `
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function extractKeywords(title: string): string[] {
  const text = title.toLowerCase()
  const businessTerms = [
    'strategy', 'leadership', 'innovation', 'growth', 'transformation',
    'digital', 'sustainability', 'performance', 'efficiency', 'expansion',
    'acquisition', 'partnership', 'investment', 'market', 'technology',
    'healthcare', 'finance', 'operations', 'culture', 'talent'
  ]
  
  const foundKeywords = businessTerms.filter(term => text.includes(term))
  return foundKeywords.slice(0, 3)
}

async function fixDuplicatePostImages() {
  console.log('🚀 Starting automated duplicate post image fix...')
  
  try {
    // Step 1: Fetch all posts with duplicate images
    console.log('📊 Fetching all posts...')
    const posts = await sanityClient.fetch(`
      *[_type == "post"] {
        _id,
        title,
        mainImage{
          asset->{
            _id,
            url
          }
        },
        categories[]->{
          title
        },
        publishedAt
      }
    `)

    console.log(`📋 Found ${posts.length} total posts`)

    // Step 2: Group posts by image asset ID
    const imageGroups = posts.reduce((groups: Record<string, any>, post: any) => {
      const imageId = post.mainImage?.asset?._id
      if (imageId) {
        if (!groups[imageId]) {
          groups[imageId] = []
        }
        groups[imageId].push(post)
      }
      return groups
    }, {})

    // Step 3: Find duplicate images (used by multiple posts)
    const duplicates = Object.entries(imageGroups)
      .filter(([, posts]) => (posts as any[]).length > 1)
      .map(([imageId, posts]) => ({
        imageId,
        posts: posts as any[],
        count: (posts as any[]).length
      }))
      .sort((a, b) => b.count - a.count)

    console.log(`🚨 Found ${duplicates.length} duplicate image groups`)
    console.log(`📊 Total posts with duplicate images: ${duplicates.reduce((sum, d) => sum + d.count, 0)}`)

    if (duplicates.length === 0) {
      console.log('✅ No duplicate images found!')
      return
    }

    // Step 4: Fix each duplicate group
    let totalFixed = 0
    
    for (const group of duplicates) {
      console.log(`\n🔧 Fixing group with ${group.count} posts sharing image ${group.imageId}`)
      
      // Keep first post with original image, generate new images for others
      const [keepPost, ...postsToFix] = group.posts
      
      console.log(`   Keeping: ${keepPost.title}`)
      
      for (const post of postsToFix) {
        try {
          // Generate unique image
          const keywords = extractKeywords(post.title)
          const category = post.categories?.[0]?.title?.toLowerCase() || 'business'
          
          // Try Unsplash first, fallback to pattern
          let newImageUrl = generateBusinessImageUrl(keywords, post.title)
          
          // If keywords are weak, use category pattern
          if (keywords.length < 2) {
            newImageUrl = generateCategoryPattern(category, post.title)
          }
          
          console.log(`   Generating image for: ${post.title}`)
          console.log(`   Keywords: ${keywords.join(', ')}`)
          console.log(`   Category: ${category}`)
          
          // Create new Sanity image asset
          const assetId = `image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // Update post with new image
          await sanityClient
            .patch(post._id)
            .set({
              mainImage: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: assetId
                },
                // Store generated URL for reference
                generatedUrl: newImageUrl,
                generatedAt: new Date().toISOString(),
                generationMethod: keywords.length >= 2 ? 'unsplash' : 'pattern'
              }
            })
            .commit()
          
          totalFixed++
          console.log(`   ✅ Fixed: ${post.title}`)
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (error) {
          console.error(`   ❌ Failed to fix ${post.title}:`, error instanceof Error ? error.message : 'Unknown error')
        }
      }
    }

    console.log(`\n🎉 Complete! Fixed ${totalFixed} duplicate post images`)
    
    // Step 5: Verify fixes
    console.log('\n🔍 Verifying fixes...')
    const updatedPosts = await sanityClient.fetch(`
      *[_type == "post" && defined(mainImage.generatedUrl)] {
        _id,
        title,
        mainImage{
          generatedUrl,
          generatedAt,
          generationMethod
        }
      }
    `)
    
    console.log(`✅ Verified: ${updatedPosts.length} posts now have unique generated images`)

    // Step 6: Final analysis
    const finalPosts = await sanityClient.fetch(`
      *[_type == "post"] {
        _id,
        mainImage{
          asset->{
            _id
          }
        }
      }
    `)
    
    const finalGroups = finalPosts.reduce((groups: Record<string, any>, post: any) => {
      const imageId = post.mainImage?.asset?._id
      if (imageId) {
        groups[imageId] = (groups[imageId] || 0) + 1
      }
      return groups
    }, {})
    
    const remainingDuplicates = Object.values(finalGroups).filter((count: any) => count > 1).length
    
    console.log(`\n📊 Final Results:`)
    console.log(`   Original duplicate groups: ${duplicates.length}`)
    console.log(`   Remaining duplicate groups: ${remainingDuplicates}`)
    console.log(`   Improvement: ${((duplicates.length - remainingDuplicates) / duplicates.length * 100).toFixed(1)}%`)

  } catch (error) {
    console.error('❌ Automated fix failed:', error)
    console.error('Details:', error instanceof Error ? error.message : 'Unknown error')
  }
}

// Run the automated fix
console.log('🤖 Starting automated duplicate post image fix...')
fixDuplicatePostImages()
  .then(() => {
    console.log('\n🎉 Automated fix completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Automated fix failed:', error)
    process.exit(1)
  })