import { client } from '../lib/sanity'

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
      }`,
      {},
      { useCdn: false }
    )
    
    console.log('✅ Spotlight Config fetched')
    console.log(`   - Card count: ${spotlightConfig?.cardCount}`)
    console.log(`   - Items: ${spotlightConfig?.items?.length || 0}`)
    
    // Check for null/undefined items
    const badItems = spotlightConfig?.items?.filter((item: any, idx: number) => {
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
    
    console.log('\n   Sample item:', JSON.stringify(spotlightConfig?.items?.[0], null, 2))
  } catch (e) {
    console.error('❌ Spotlight Config fetch failed:', e)
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
    
    console.log('\n   Data:', JSON.stringify(executiveInFocus, null, 2))
  } catch (e) {
    console.error('❌ Executive in Focus fetch failed:', e)
  }
  
  console.log('\n3️⃣  Fetching Industry Juggernaut Config...')
  try {
    const juggernautConfig = await client.fetch(
      `*[_type == "industryJuggernautConfig"][0]{
        items
      }`
    )
    
    console.log('✅ Juggernaut Config fetched')
    console.log(`   - Items: ${juggernautConfig?.items?.length || 0}`)
    
    if (!juggernautConfig?.items || juggernautConfig.items.length === 0) {
      console.log('   ⚠️  No juggernaut items found')
    } else {
      console.log('   ✅ Juggernaut Config looks valid')
    }
  } catch (e) {
    console.error('❌ Juggernaut Config fetch failed:', e)
  }
  
  console.log('\n4️⃣  Fetching Guest Authors...')
  try {
    const authors = await client.fetch(
      `*[_type == "writer" && role == "guest"] | order(_createdAt desc)[0...6]{
        _id,
        name,
        slug,
        image,
        bio
      }`
    )
    
    console.log('✅ Guest Authors fetched')
    console.log(`   - Count: ${authors?.length || 0}`)
    
    const badAuthors = authors?.filter((author: any, idx: number) => {
      if (!author.slug?.current) {
        console.log(`   ⚠️  Author ${idx} ("${author.name}") has no slug`)
        return true
      }
      return false
    })
    
    if (badAuthors?.length > 0) {
      console.log(`   ❌ Found ${badAuthors.length} authors with missing slugs`)
    } else {
      console.log('   ✅ All authors look valid')
    }
  } catch (e) {
    console.error('❌ Guest Authors fetch failed:', e)
  }
  
  console.log('\n✅ Diagnostic complete!')
}

diagnose().catch(console.error)
