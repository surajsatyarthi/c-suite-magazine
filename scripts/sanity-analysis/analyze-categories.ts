#!/usr/bin/env tsx
/**
 * Sanity Content Analysis - Category Distribution
 *
 * Analyzes:
 * - Total categories
 * - Articles per category (post + csa)
 * - Content distribution
 * - Most/least active categories
 */

// Import the existing Sanity client from the app
import { client } from '../../sanity/lib/client'

async function main() {
  console.log('🔍 Starting Sanity Content Analysis...\n')

  try {
    // Query all categories with article counts
    const categoriesQuery = `
      *[_type == "category"] | order(title asc) {
        _id,
        title,
        slug,
        description,
        "postCount": count(*[_type == "post" && references(^._id) && !(_id in path("drafts.**"))]),
        "csaCount": count(*[_type == "csa" && references(^._id) && !(_id in path("drafts.**"))]),
        "totalArticles": count(*[_type in ["post", "csa"] && references(^._id) && !(_id in path("drafts.**"))]),
        "latestPost": *[_type in ["post", "csa"] && references(^._id) && !(_id in path("drafts.**"))] | order(publishedAt desc)[0].publishedAt
      }
    `

    const categories = await client.fetch(categoriesQuery)

    // Get total article counts (including uncategorized)
    const totalPostsQuery = `count(*[_type == "post" && !(_id in path("drafts.**"))])`
    const totalCsasQuery = `count(*[_type == "csa" && !(_id in path("drafts.**"))])`

    const totalPosts = await client.fetch(totalPostsQuery)
    const totalCsas = await client.fetch(totalCsasQuery)
    const totalArticles = totalPosts + totalCsas

    // Calculate stats
    const totalCategories = categories.length
    const categorizedArticles = categories.reduce((sum: number, cat: any) => sum + cat.totalArticles, 0)
    const uncategorizedArticles = totalArticles - categorizedArticles

    console.log('═══════════════════════════════════════════════════════════')
    console.log('              SANITY CONTENT OVERVIEW')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`Total Categories:       ${totalCategories}`)
    console.log(`Total Articles:         ${totalArticles} (${totalPosts} posts + ${totalCsas} CSAs)`)
    console.log(`Categorized Articles:   ${categorizedArticles}`)
    console.log(`Uncategorized:          ${uncategorizedArticles}`)
    console.log('═══════════════════════════════════════════════════════════\n')

    console.log('CATEGORY DISTRIBUTION:\n')
    console.log('┌─────────────────────────────┬───────┬──────┬───────┬────────────┐')
    console.log('│ Category                    │ Posts │ CSAs │ Total │ % of Total │')
    console.log('├─────────────────────────────┼───────┼──────┼───────┼────────────┤')

    categories.forEach((cat: any) => {
      const percentage = totalArticles > 0 ? ((cat.totalArticles / totalArticles) * 100).toFixed(1) : '0.0'
      const categoryName = cat.title.padEnd(27)
      const posts = String(cat.postCount).padStart(5)
      const csas = String(cat.csaCount).padStart(4)
      const total = String(cat.totalArticles).padStart(5)
      const pct = String(percentage + '%').padStart(10)

      console.log(`│ ${categoryName} │ ${posts} │ ${csas} │ ${total} │ ${pct} │`)
    })

    console.log('└─────────────────────────────┴───────┴──────┴───────┴────────────┘\n')

    // Find most/least active categories
    const sortedByTotal = [...categories].sort((a: any, b: any) => b.totalArticles - a.totalArticles)
    const mostActive = sortedByTotal.slice(0, 3)
    const leastActive = sortedByTotal.slice(-3).reverse()
    const emptyCategories = categories.filter((cat: any) => cat.totalArticles === 0)

    console.log('📊 KEY INSIGHTS:\n')

    console.log('Top 3 Most Active Categories:')
    mostActive.forEach((cat: any, index: number) => {
      console.log(`  ${index + 1}. ${cat.title}: ${cat.totalArticles} articles (${cat.postCount} posts, ${cat.csaCount} CSAs)`)
    })
    console.log()

    console.log('Bottom 3 Least Active Categories:')
    leastActive.forEach((cat: any, index: number) => {
      console.log(`  ${index + 1}. ${cat.title}: ${cat.totalArticles} articles (${cat.postCount} posts, ${cat.csaCount} CSAs)`)
    })
    console.log()

    if (emptyCategories.length > 0) {
      console.log(`⚠️  Empty Categories: ${emptyCategories.length}`)
      emptyCategories.forEach((cat: any) => {
        console.log(`  - ${cat.title} (slug: ${cat.slug.current})`)
      })
      console.log()
    }

    console.log('📈 CONTENT METRICS:\n')
    const avgArticlesPerCategory = totalCategories > 0 ? (categorizedArticles / totalCategories).toFixed(1) : '0.0'
    const csaPercentage = totalArticles > 0 ? ((totalCsas / totalArticles) * 100).toFixed(1) : '0.0'

    console.log(`Average articles per category:  ${avgArticlesPerCategory}`)
    console.log(`CSA vs Regular posts:           ${totalCsas} CSAs (${csaPercentage}%) vs ${totalPosts} posts (${(100 - parseFloat(csaPercentage)).toFixed(1)}%)`)
    console.log()

    // Show latest activity per category
    console.log('📅 LATEST ACTIVITY BY CATEGORY:\n')
    const categoriesWithActivity = categories.filter((cat: any) => cat.latestPost)
    const sortedByLatest = categoriesWithActivity.sort((a: any, b: any) =>
      new Date(b.latestPost).getTime() - new Date(a.latestPost).getTime()
    )

    sortedByLatest.slice(0, 5).forEach((cat: any, index: number) => {
      const date = new Date(cat.latestPost).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      console.log(`  ${index + 1}. ${cat.title}: ${date}`)
    })

    console.log('\n✅ Analysis Complete!\n')

  } catch (error) {
    console.error('❌ Error analyzing Sanity content:', error)
    process.exit(1)
  }
}

main()
