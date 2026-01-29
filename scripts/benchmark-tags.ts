import { createClient } from 'next-sanity'

// Hardcode or robustly load envs for script execution context
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8' // Correct ID from env
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

// Explicitly use a read-only client for benchmarking
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Force fresh fetch for accurate timing
  perspective: 'published',
})

async function benchmark() {
  console.log('🚀 Benchmarking Tag Queries...')

  // 1. Benchmark getAllUniqueTags (The bottleneck candidate)
  const startAll = performance.now()
  const queryAll = `*[_type == "post" && defined(tags)].tags[]`
  const tags = await client.fetch(queryAll)
  const uniqueTags = new Set(tags)
  const endAll = performance.now()

  console.log(`\n---------------------------------------------------`)
  console.log(`📊 [getAllUniqueTags]`)
  console.log(`   - Raw Items Fetched: ${tags.length}`)
  console.log(`   - Unique Tags:       ${uniqueTags.size}`)
  console.log(`   - Execution Time:    ${(endAll - startAll).toFixed(2)}ms`)
  console.log(`---------------------------------------------------`)

  if (uniqueTags.size === 0) {
    console.log('⚠️  No tags found. Skipping posts query.')
    return
  }

  // 2. Benchmark getTagPosts for a random tag
  const sampleTag = Array.from(uniqueTags)[0] as string
  const startPosts = performance.now()
  // Use the exact query from page.tsx (with parameterization)
  const queryPosts = `*[_type in ["post", "csa"] && defined(tags) && $originalTag in tags] | order(publishedAt desc) { _id, title, slug }`
  const posts = await client.fetch(queryPosts, { originalTag: sampleTag })
  const endPosts = performance.now()

  console.log(`\n---------------------------------------------------`)
  console.log(`📊 [getTagPosts] (Sample: "${sampleTag}")`)
  console.log(`   - Posts Found:    ${posts.length}`)
  console.log(`   - Execution Time: ${(endPosts - startPosts).toFixed(2)}ms`)
  console.log(`---------------------------------------------------`)
}

benchmark().catch(console.error)
