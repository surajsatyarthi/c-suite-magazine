const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '2f93fcy8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false, // Force fresh data
    token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
})

async function verifyHomepage() {
    console.log('--- Homepage Verification Report ---')

    // 1. Check Hero (Executive In Focus)
    const hero = await client.fetch(`*[_type == "executiveInFocus"][0]{title, link}`)
    console.log('\n[HERO SECTION]')
    if (hero) {
        console.log(`Title: ${hero.title}`)
        console.log(`Link : ${hero.link}`)
        
        if (hero.title.includes('Sukhinder')) {
            console.log('✅ PASS: Sukhinder is the Hero.')
        } else {
            console.log('❌ FAIL: Sukhinder is NOT the Hero.')
        }
    } else {
        console.log('❌ FAIL: No Executive in Focus found.')
    }

    // 2. Check Spotlight Grid
    // We simulate the NEW logic (no filtering of featuredName)
    const query = `*[_type == "spotlightConfig"] | order(_updatedAt desc)[0]{
          items[]->{ title, slug }
    }`
    const config = await client.fetch(query)
    const items = config.items || []
    
    // Simulate Lib Logic: Just slice 0-13
    const gridItems = items.slice(0, 13)
    
    console.log('\n[SPOTLIGHT GRID]')
    gridItems.forEach((item, index) => {
        if (!item) return
        console.log(`${index + 1}. ${item.title}`)
    })

    // Verification Logic
    if (gridItems.length > 0 && gridItems[0].title.includes('Rich Stinson')) {
        console.log('\n✅ PASS: Rich Stinson is #1 in Grid.')
    } else {
        console.log('\n❌ FAIL: Rich Stinson is NOT #1.')
    }
    
    if (gridItems.length > 1 && gridItems[1].title.includes('Stella Ambrose')) {
        console.log('✅ PASS: Stella Ambrose is #2 in Grid.')
    } else {
        console.log('❌ FAIL: Stella Ambrose is NOT #2.')
    }
    
    // Check for Duplicate Sukhinder
    const duplicate = gridItems.find(i => i && i.title.includes('Sukhinder'))
    if (!duplicate) {
        console.log('✅ PASS: Sukhinder does not appear in Grid (Correct, she is Hero).')
    } else {
        console.log('❌ FAIL: Sukhinder appears in Grid (Duplicate).')
    }
}

verifyHomepage()
