require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@sanity/client')

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_TOKEN,
})

async function findBrabusAd() {
    console.log('Querying Sanity for advertisements...')
    const query = `*[_type == "advertisement"] {
    _id,
    name,
    targetUrl,
    placement,
    isActive,
    startDate,
    endDate,
    priority
  }`

    try {
        const ads = await client.fetch(query)
        console.log(`Found ${ads.length} advertisements:`)
        ads.forEach(ad => {
            console.log('---------------------------------------------------')
            console.log(`Name: ${ad.name}`)
            console.log(`ID: ${ad._id}`)
            console.log(`Target URL: ${ad.targetUrl}`)
            console.log(`Placement: ${ad.placement}`)
            console.log(`Active: ${ad.isActive}`)
            console.log(`Priority: ${ad.priority}`)
            if (ad.startDate) console.log(`Start Date: ${ad.startDate}`)
            if (ad.endDate) console.log(`End Date: ${ad.endDate}`)
        })

        const brabusAds = ads.filter(ad =>
            (ad.name && ad.name.toLowerCase().includes('brabus')) ||
            (ad.targetUrl && ad.targetUrl.toLowerCase().includes('brabus'))
        )

        if (brabusAds.length > 0) {
            console.log('\n✅ POTENTIAL BRABUS ADS FOUND:', brabusAds.length)
        } else {
            console.log('\n❌ NO BRABUS ADS FOUND.')
        }

    } catch (err) {
        console.error('Error fetching ads:', err.message)
    }
}

findBrabusAd()
