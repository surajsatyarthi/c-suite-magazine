const { createClient } = require('@sanity/client')
require('dotenv').config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-28',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function uploadImageFromUrl(url, filenameHint = 'ad.jpg') {
  const res = await fetch(url)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await client.assets.upload('image', buffer, { filename: filenameHint })
  return asset
}

const ads = [
  {
    name: 'Sidebar 300x250 - Premium Partner',
    placement: 'article-sidebar',
    targetUrl: 'https://example.com/premium-partner',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
    alt: 'Premium partner advertisement',
    dimensions: { width: 300, height: 250 },
    priority: 8,
  },
  {
    name: 'Sidebar Large 300x600 - Enterprise Solutions',
    placement: 'article-sidebar-large',
    targetUrl: 'https://example.com/enterprise',
    imageUrl: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&h=800&fit=crop',
    alt: 'Enterprise solutions advertisement',
    dimensions: { width: 300, height: 600 },
    priority: 7,
  },
  {
    name: 'In-Article 728x90 - Leadership Summit',
    placement: 'in-article',
    targetUrl: 'https://example.com/summit',
    imageUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=400&fit=crop',
    alt: 'Leadership summit advertisement',
    dimensions: { width: 728, height: 90 },
    priority: 9,
  },
  {
    name: 'Homepage Banner 970x250 - Global Conference',
    placement: 'homepage-banner',
    targetUrl: 'https://example.com/conference',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1400&h=400&fit=crop',
    alt: 'Global conference advertisement',
    dimensions: { width: 970, height: 250 },
    priority: 10,
  },
]

async function populateAds() {
  console.log('Starting to populate ads...')

  for (const a of ads) {
    try {
      const slug = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const asset = await uploadImageFromUrl(a.imageUrl, `${slug}.jpg`)
      const doc = {
        _type: 'advertisement',
        name: a.name,
        image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt: a.alt },
        targetUrl: a.targetUrl,
        placement: a.placement,
        dimensions: a.dimensions,
        isActive: true,
        priority: a.priority,
      }

      await client.create(doc)
      console.log(`✓ Created ad: ${a.name}`)
    } catch (error) {
      console.error(`✗ Failed to create ad ${a.name}:`, error.message)
    }
  }

  console.log('\nDone! Ads have been populated.')
}

populateAds()
