const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '2f93fcy8',
  dataset: 'production-fixed',
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN
})

async function checkAdsFixed() {
  const query = `*[_type == "advertisement"] {
    name,
    placement,
    isActive,
    "imageUrl": image.asset->url,
    targetUrl
  }`
  const ads = await client.fetch(query)
  console.log('Fixed Ads:', JSON.stringify(ads, null, 2))
}

checkAdsFixed()
