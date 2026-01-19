const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

async function listSpotlightImages() {
  console.log('📸 Fetching Spotlight Images from Sanity...\n')
  
  try {
    const config = await client.fetch(
      `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
        cardCount,
        items[]->{
          _id,
          title,
          slug,
          "spotlightImageUrl": spotlightImage.asset->url,
          "mainImageUrl": mainImage.asset->url,
          "hasSpotlightImage": defined(spotlightImage.asset),
          "hasMainImage": defined(mainImage.asset)
        }
      }`
    )
    
    if (!config) {
      console.log('❌ No spotlight config found')
      return
    }
    
    console.log(`✅ Found ${config.items?.length || 0} spotlight items\n`)
    console.log('═══════════════════════════════════════════════════════════\n')
    
    config.items?.forEach((item, idx) => {
      console.log(`${idx + 1}. ${item.title}`)
      console.log(`   Slug: ${item.slug?.current || 'N/A'}`)
      console.log(`   Has Spotlight Image: ${item.hasSpotlightImage ? '✅' : '❌'}`)
      console.log(`   Has Main Image: ${item.hasMainImage ? '✅' : '❌'}`)
      
      if (item.spotlightImageUrl) {
        console.log(`   📸 Spotlight: ${item.spotlightImageUrl}`)
      } else if (item.mainImageUrl) {
        console.log(`   📸 Main: ${item.mainImageUrl}`)
      } else {
        console.log(`   ⚠️  NO IMAGE FOUND`)
      }
      console.log('')
    })
    
  } catch (e) {
    console.error('❌ Error:', e.message)
  }
}

listSpotlightImages()
