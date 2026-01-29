import { createClient } from 'next-sanity'
import { slugifyTag } from '../lib/tag-utils'

// Minimal Client Setup (Env vars must be loaded)
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function run() {
  console.log('🔍 Debugging Tag Logic...')
  
  // 1. Fetch All Tags
  const query = `*[_type == "post" && defined(tags)].tags[]`
  const tags: string[] = await client.fetch(query)
  const uniqueTags = Array.from(new Set(tags))
  console.log(`✅ Found ${uniqueTags.length} unique tags.`)
  
  if (uniqueTags.length === 0) {
    console.error('❌ No tags found!')
    process.exit(1)
  }

  // 2. Pick a candidate
  const candidate = uniqueTags[0]
  const slug = slugifyTag(candidate)
  console.log(`🎯 Candidate: "${candidate}" -> Slug: "${slug}"`)
  
  // 3. Reverse Lookup Verification
  const match = uniqueTags.find(t => slugifyTag(t) === slug)
  console.log(`🔄 Reverse Lookup Match: "${match}"`)
  
  if (match !== candidate) {
    console.warn('⚠️  Mismatch/Collision warning!')
  }
  
  // 4. Query Posts
  console.log(`🔎 Querying posts for tag: "${match}"...`)
  const postQuery = `*[_type in ["post", "csa"] && defined(tags) && $match in tags] { title, slug }`
  const posts = await client.fetch(postQuery, { match })
  
  console.log(`📦 Found ${posts.length} posts.`)
  if (posts.length > 0) {
    console.log(`   Sample: ${posts[0].title}`)
    console.log('✅ Logic verified!')
  } else {
    console.error('❌ Query returned 0 posts! Data consistency issue?')
  }
}

run().catch(console.error)
