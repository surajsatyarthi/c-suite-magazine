/**
 * Comprehensive Article and Image Analysis
 * Analyzes all content types for duplicate images
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

async function comprehensiveAnalysis() {
  console.log('🔍 Starting comprehensive article and image analysis...')
  
  try {
    // Step 1: Check what content types exist
    console.log('📋 Checking available content types...')
    const contentTypes = await sanityClient.fetch(`
      *[_type == "sanity.imageAsset"] {
        _id,
        url,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    `)
    
    console.log(`📊 Found ${contentTypes.length} total image assets in Sanity`)

    // Step 2: Try different article queries
    console.log('🔍 Searching for articles across different schemas...')
    
    // Try standard article query
    let articles = []
    try {
      articles = await sanityClient.fetch(`
        *[_type == "article"] {
          _id,
          _type,
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
      console.log(`✅ Found ${articles.length} articles with type 'article'`)
    } catch (error) {
      console.log('❌ No articles found with type "article"')
    }

    // Step 3: Try post type if no articles found
    if (articles.length === 0) {
      try {
        articles = await sanityClient.fetch(`
          *[_type == "post"] {
            _id,
            _type,
            title,
            slug,
            publishedAt,
            categories[]->{
              title,
              slug
            },
            mainImage{
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
        console.log(`✅ Found ${articles.length} posts with type 'post'`)
      } catch (error) {
        console.log('❌ No posts found with type "post"')
      }
    }

    // Step 4: Try any document with image fields
    if (articles.length === 0) {
      console.log('🔍 Searching for any documents with image fields...')
      
      // Find documents that have any image reference
      const docsWithImages = await sanityClient.fetch(`
        *[_type in ["article", "post", "blog", "news", "content"]] {
          _id,
          _type,
          title,
          slug,
          "hasFeaturedImage": defined(featuredImage),
          "hasMainImage": defined(mainImage),
          "hasHeroImage": defined(heroImage),
          "hasImage": defined(image)
        }
      `)
      
      console.log(`📊 Found ${docsWithImages.length} documents with potential image fields`)
      
      if (docsWithImages.length > 0) {
        console.log('📋 Sample document structure:')
        console.log(JSON.stringify(docsWithImages[0], null, 2))
        
        // Try to fetch complete data for first document
        const firstDoc = docsWithImages[0]
        const completeDoc = await sanityClient.fetch(`
          *[_id == $id][0] {
            _id,
            _type,
            title,
            slug,
            featuredImage{
              asset->{
                _id,
                url
              }
            },
            mainImage{
              asset->{
                _id,
                url
              }
            },
            heroImage{
              asset->{
                _id,
                url
              }
            },
            image{
              asset->{
                _id,
                url
              }
            }
          }
        `, { id: firstDoc._id })
        
        console.log('🔍 Complete document with images:')
        console.log(JSON.stringify(completeDoc, null, 2))
      }
    }

    // Step 5: If we found articles, analyze them
    if (articles.length > 0) {
      console.log('\n📊 ANALYZING FOUND ARTICLES...')
      
      // Group by image asset ID
      const imageGroups = articles.reduce((groups: Record<string, any>, article: any) => {
        // Try different image field names
        const imageField = article.featuredImage || article.mainImage || article.heroImage || article.image
        const imageId = imageField?.asset?._id
        
        if (imageId) {
          if (!groups[imageId]) {
            groups[imageId] = {
              imageId,
              imageUrl: imageField.asset.url,
              articles: [],
              count: 0
            }
          }
          
          groups[imageId].articles.push({
            _id: article._id,
            title: article.title,
            _type: article._type,
            slug: article.slug?.current,
            publishedAt: article.publishedAt
          })
          
          groups[imageId].count++
        }
        
        return groups
      }, {})

      // Find duplicates
      const duplicates = Object.values(imageGroups)
        .filter((group: any) => group.count > 1)
        .sort((a: any, b: any) => b.count - a.count)

      console.log('\n📋 DUPLICATE ANALYSIS:')
      console.log(`   Total Articles: ${articles.length}`)
      console.log(`   Articles with Images: ${articles.filter((a: any) => (a.featuredImage || a.mainImage || a.heroImage || a.image)?.asset?._id).length}`)
      console.log(`   Unique Images: ${Object.keys(imageGroups).length}`)
      console.log(`   Duplicate Groups: ${duplicates.length}`)

      if (duplicates.length > 0) {
        console.log('\n🔍 TOP DUPLICATE GROUPS:')
        duplicates.slice(0, 5).forEach((group: any, index) => {
          console.log(`\n   ${index + 1}. Image used by ${group.count} articles:`)
          group.articles.forEach((article: any) => {
            console.log(`      📄 ${article.title} (${article._type})`)
          })
        })
      }
    }

    // Step 6: General Sanity schema analysis
    console.log('\n🔍 GENERAL SANITY ANALYSIS:')
    
    // Count all document types
    const docTypes = await sanityClient.fetch(`
      *[_type != "sanity.imageAsset"] {
        _type
      }
    `)
    
    const typeCounts = docTypes.reduce((counts: Record<string, number>, doc: any) => {
      counts[doc._type] = (counts[doc._type] || 0) + 1
      return counts
    }, {})
    
    console.log('\n📊 Document Type Distribution:')
    Object.entries(typeCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`)
      })

    console.log('\n✅ Comprehensive analysis complete!')
    
    if (articles.length === 0) {
      console.log('\n💡 RECOMMENDATIONS:')
      console.log('   1. Check if articles exist with different content type names')
      console.log('   2. Verify image field names (featuredImage, mainImage, heroImage, etc.)')
      console.log('   3. Check Sanity Studio configuration for actual schema')
      console.log('   4. Review existing content structure in Sanity Studio')
    }

  } catch (error) {
    console.error('❌ Comprehensive analysis failed:', error)
    console.error('Details:', error instanceof Error ? error.message : 'Unknown error')
  }
}

// Run the comprehensive analysis
console.log('🤖 Starting comprehensive analysis...')
comprehensiveAnalysis()
  .then(() => {
    console.log('\n🎉 Analysis completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Analysis failed:', error)
    process.exit(1)
  })