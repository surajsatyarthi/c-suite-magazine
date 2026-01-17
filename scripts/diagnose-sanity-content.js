const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

console.log('🔍 Sanity Content Diagnostic Tool')
console.log('===================================\n')

async function diagnose() {
  console.log('1️⃣  Fetching Spotlight Config...')
  try {
    const spotlightConfig = await client.fetch(
      `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
        cardCount,
        items[]->{
          _id,
          _type,
          title,
          slug,
          mainImage,
          spotlightImage,
          "primaryCategory": categories[0]->{slug}
        }
      }`
    )
    
    console.log('✅ Spotlight Config fetched')
    console.log(`   - Card count: ${spotlightConfig?.cardCount}`)
    console.log(`   - Items: ${spotlightConfig?.items?.length || 0}`)
    
    // Check for null/undefined items
    const badItems = spotlightConfig?.items?.filter((item, idx) => {
      if (!item) {
        console.log(`   ⚠️  Item ${idx} is null/undefined`)
        return true
      }
      if (!item.slug?.current) {
        console.log(`   ⚠️  Item ${idx} ("${item.title}") has no slug`)
        return true
      }
      if (!item.mainImage && !item.spotlightImage) {
        console.log(`   ⚠️  Item ${idx} ("${item.title}") has no images`)
        return true
      }
      return false
    })
    
    if (badItems?.length > 0) {
      console.log(`   ❌ Found ${badItems.length} problematic items in spotlight`)
    } else {
      console.log('   ✅ All spotlight items look valid')
    }
    
    console.log('\n   First 3 items:')
    spotlightConfig?.items?.slice(0, 3).forEach((item, idx) => {
      console.log(`     ${idx + 1}. ${item?.title || 'NO TITLE'} (${item?.slug?.current || 'NO SLUG'})`)
    })
  } catch (e) {
    console.error('❌ Spotlight Config fetch failed:', e.message)
  }
  
  console.log('\n2️⃣  Fetching Executive in Focus...')
  try {
    const executiveInFocus = await client.fetch(
      `*[_type == "executiveInFocus"] | order(publishedAt desc)[0]{
        title,
        position,
        description,
        image,
        link
      }`
    )
    
    console.log('✅ Executive in Focus fetched')
    console.log(`   - Title: ${executiveInFocus?.title || 'N/A'}`)
    console.log(`   - Has image: ${!!executiveInFocus?.image}`)
    console.log(`   - Link: ${executiveInFocus?.link || 'N/A'}`)
    
    if (!executiveInFocus) {
      console.log('   ⚠️  No executive in focus found')
    } else if (!executiveInFocus.image) {
      console.log('   ⚠️  Executive in focus has no image')
    } else {
      console.log('   ✅ Executive in Focus looks valid')
    }
  } catch (e) {
    console.error('❌ Executive in Focus fetch failed:', e.message)
  }
  
  console.log('\n3️⃣  Testing URLFor with spotlight image...')
  try {
    const spotlightConfig = await client.fetch(
      `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
        items[0]->{
          mainImage,
          spotlightImage
        }
      }`
    )
    
    const firstItem = spotlightConfig?.items?.[0]
    const chosenImage = firstItem?.spotlightImage || firstItem?.mainImage
    
    console.log(`   - Image object type: ${typeof chosenImage}`)
    console.log(`   - Has asset: ${!!chosenImage?.asset}`)
    console.log(`   - Has _ref: ${!!chosenImage?._ref}`)
    
    if (!chosenImage || (!chosenImage.asset && !chosenImage._ref)) {
      console.log('   ❌ First spotlight item has invalid image - THIS IS LIKELY THE ISSUE!')
    } else {
      console.log('   ✅ Image structure looks valid')
    }
  } catch (e) {
    console.error('❌ Image test failed:', e.message)
  }
  
  console.log('\n✅ Diagnostic complete!')
}

diagnose().catch(err => {
  console.error('\n❌ FATAL ERROR:', err)
  process.exit(1)
})
