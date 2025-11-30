const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN
})

async function checkAds() {
  const query = `*[_type == "advertisement"] {
    name,
    placement,
    isActive,
    "imageUrl": image.asset->url,
    targetUrl
  }`
  const ads = await client.fetch(query)
  console.log('Global Ads:', JSON.stringify(ads, null, 2))
}

checkAds()
